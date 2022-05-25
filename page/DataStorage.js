/* This program runs once hourly from the terminal to call for the last 1 hour of sensor data from all the Tacoma Eclipse sensors
 * A new file will be saved monthly, and data will continuously be concatenated to it for the duration of the month
 * Author: Allysen Arntsen
 * Last edited by AA on 5/10/22
 * 
*/

// note that if any new devices are added, their device numbers must be added to the devices array

// Must do "npm install" for each of the following add-on packages (in addition to having Node.js installed)
// because shell is required to run the other installations, it must be manually installed first
// command: npm install shelljs
var fs = require('fs');
const axios = require('axios')
const replace = require('buffer-replace');
const shell = require('shelljs');

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
var today = new Date();   // update date for first day of program run (initialization)
const devices = ["2189", "2190", "2200", "2201", "2202", "2203", "2204", "2205", "2206", "2215", "2216", "2217"];
var addr = 'https://urban.microsoft.com/api/EclipseData/GetReadings?city=Tacoma&hours=1';
const headers = {'ApiKey' : '5DC5D3CE-CC03-432B-B6B3-8F8B2E744232'}

// if first run on this machine, run initalization function
//initialization();
    
// make an initial function call to avoid waiting an hour for the first set of data
callStore();

// after initial call, wait one hour to call for the next hour of data
setInterval(() => {
     callStore();
}, 3600000)  // 1 hour = 1000 ms * 60 s * 60 min = 3600000 ms



/***************************************************************************************************************************/
/***** This function makes the call to the Eclipse API for the last hour of data and stores it locally *********************/
/***************************************************************************************************************************/
async function callStore(){

    console.log("Storeage: Started data retrieval and storage process")

    today = new Date();   // update date for new day
    var monthFile = months[today.getMonth()] + (today.getFullYear()) + ".json"; // build the file name for the current month and year

    // If it is not a new month, we need to remove the JSON end character "]" and replace it with "," so we can append the next day's data
    // If the file does not exist, there is no character to replace
    // If the month has changed, the file we're looking far does not exist yet
    if (fs.existsSync(monthFile)){

        // read previous contents of this month's file
        fs.readFile(monthFile, function (err, data){

            // throw a file read error if needed
            if (err){return console.log("Storeage: Read file error");}

            // if there is data in the file
            if (data != null){
                
                // replace the json end char with a ","
                var result = replace(data,"]",",");

                // write changes back to file
                fs.writeFile(monthFile, result, function (err){

                    // throw error if needed
                    if (err){return console.log("Storeage: File write error");}
                    
                })
            }
        })
        console.log("Storeage: Existing file is ready to receive appendum")
    }

    // console output that process has begun
    console.log("Storeage: Making Eclipse API call")

    // make call to the Eclipse API for the last hour of Tacoma sensor data
    await axios.get(addr, {headers})

    // when data is received
    .then(response => {

        // store data as an object
        const data = response.data

        // output to console that we have the data
        console.log("Storeage: Data received")

        // check if this month's file has already been started
        if (fs.existsSync(monthFile)){

            // since the file has already been started, we remove the starting character of the incoming json
            var result = replace(JSON.stringify(data),"[","");
            console.log("Storeage: New data is ready to be added to storage file")
            
        } else {
            // if it's a new month's file, we can keep the incoming data as is
            var result = JSON.stringify(data);
        }  
        

        // open the file labeled for the current month and year and store the data there
        // if the file doesn't exist yet, the fs.append function will create it and write the data there
        fs.appendFile(monthFile, result, function (err) {

            // catch file error if necessary
            if (err) throw err;

            // output to console that data has been stored
            console.log("Storeage: Data has been stored in: " + monthFile);
            console.log("Storeage: Finished data storage at " + new Date() + "\n\n");

            // proceed to the next function
            sendRecent();
          })
    })

    // catch data get error if necessary
    // Note: this will inform the user that data was lost and when it was lost, but it will not retrieve lost data
    .catch(function (error) {
        // report error
        console.log("\n\nStorage: An error ocurred, and data storage (hourly data from all sensors) pull from " + new Date() + " was lost.\n\n");
        // proceed to the next function
        sendRecent();
    });
    
}


/***************************************************************************************************************************/
/***** This function requests the most recent data for each sensor from the API and stores it in the GitHub repository *****/
/***************************************************************************************************************************/
async function sendRecent(){
    var base = "https://urban.microsoft.com/api/EclipseData/GetReadings?city=Tacoma&hours=24&devices="
    var fileName;

    // make call to the Eclipse API for the last hour of data from each sensor
    for (let i=0; i<devices.length; i++){
        console.log("Map Data: Making API call for device " + devices[i]);
        //console.log("Map Data: Call: " + base + devices[i]);
        await axios.get(base + devices[i], {headers})
        
        // when data is received
        .then(response => {
            
            // store data as an object
            const data = response.data
            // output to console that we have the data
            console.log("Map Data: Data received for device " + devices[i]);
            // open a new file labeled for the current week and store the data there
            fileName = "Device" + devices[i] + ".json";

            fs.writeFile(fileName, JSON.stringify(data), function (err) {
            //fs.writeFile(fileName, result[0], function (err) {
                // catch file error if necessary
                if (err)
                    throw err;
                // output to console that data has been stored
                console.log("Map Data: Data stored in: " + fileName);
                console.log("Map Data: Finished data storage for Device " + devices[i] + " at " + new Date() + "\n");
                if (i + 1 == devices.length){
                    gitStore();
                }
                
            })
        })

        // catch data get error if necessary
        .catch(function (error) {
            // report error
            console.log("\n\nMap Data: An error ocurred, and sensor pull from Device " + devices[i] + " at " + new Date() + " was lost.\n\n");
            if (i + 1 == devices.length){
                gitStore();
            }
        });

    }
    
}
/***************************************************************************************************************************/
/***** This helper function updates the file with the same name in the github repository ***********************************/
/***** Github connection and repository must already be set up, but files do not need to already exist in repository *******/
/***************************************************************************************************************************/
function gitStore(){

    // add each device to be staged for commit
    // Note: if devices are added/removed, this must be manually updated
    shell.exec('git add Device2189.json');
    shell.exec('git add Device2190.json');
    shell.exec('git add Device2200.json');
    shell.exec('git add Device2201.json');
    shell.exec('git add Device2202.json');
    shell.exec('git add Device2203.json');
    shell.exec('git add Device2204.json');
    shell.exec('git add Device2205.json');
    shell.exec('git add Device2206.json');
    shell.exec('git add Device2215.json');
    shell.exec('git add Device2216.json');
    shell.exec('git add Device2217.json');

    console.log("Git: All files staged for commit");

    // track errors
    var err = false;

    // attempt to commit data (code that != 0 means there was an error)
    if(shell.exec('git commit -m "Data update').code !== 0){

        // notify of failure to commit
        console.log('Git: Git commit at ' + new Date() + ' failed');
        
        // try a second time to commit
        console.log("Git: Attempting to recommit files"); 
        if(shell.exec('git commit -m "Data').code !== 0){

            // Notify of failure to commit backup and abort the update
            console.log('Git: Backup git commit at ' + new Date() + ' failed');
            console.log('GitHub update aborted at ' + new Date() + "\n________________________\n\n");
            err = true; // this flags the next portion to not run
        }
    } 

    shell.exec('git pull'); // update the repository clone
    var loopCnt = 0;    // set loop counter to 0 (ensures it doesn't keep trying indefinitely if it fails to push)

    // there's no reason to even try to push the data if nothing was committed
    if (!err){

        // output that commit was successful
        console.log("Git: Committed files");

        err = false;    // reset error flag

        // try 10 times max to push files to GitHub
        while (shell.exec('git push').code !== 0){
            shell.exec('git stash'); // hide unusable files
            console.log("Git: Attempting to repush files"); 

            if (loopCnt > 10){
                // notify of failure
                console.log('Git: Push unsuccessful');
                err = true; //set message flag
            }  
        } 
        // report final status
        if (!err){console.log("Git: Pushed files at " + new Date() + "\n________________________\n\n");}
        else {console.log('Data at ' + new Date() + 'was not pushed to GitHub\n________________________\n\n');}
    }    
}

/****** must be run ONCE on host machine to install necessary software and connect to GitHub *****/
function initialization(){
    console.log("Initializing\n")

    // installs additional packages
    console.log("Installing required packages\n")
    shell.exec("npm install buffer-replace")
    shell.exec("npm install axios")
    console.log("Required packages installed\n")

    // sets up GitHub connection
    console.log("Set up GitHub connection\n")
    // Sign in to github
    // Answer: GitHub.com, HTTPS, Y, Login with a web browser
    // press enter and copy code (if already logged into GitHub on this machine in default browser)
    // if not, go to github.com/login/device in a browser that is already logged in to tacomaAQ on GitHub
    shell.exec("gh auth login");
    shell.exec('git remote add origin https://github.com/tacomaAQ/taq');
    console.log("Connected to GitHub\n")
}