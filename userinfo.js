var request = require('request');

function getUserName(steamid, callback) {
    getUserInfo(steamid, function(error, data){
        if(error) throw error;
        var datadec = JSON.parse(JSON.stringify(data.response));
        var name = datadec.players[0].personaname;
        callback(name);
    });
}

function getUserPicture(steamid, callback){
    getUserInfo(steamid, function(error, data){
        if(error) throw error;
        var datadec = JSON.parse(JSON.stringify(data.response));
        var picture = datadec.players[0].avatarfull;
        callback(picture)
    });
}


function getImportantStats(steamid, callback){
    getStatsForSteamId(steamid, function(error, data){
        if(error) throw error;
        var datadec = JSON.parse(JSON.stringify(data.playerstats));
        stats = {
            "kills": datadec.stats[0].value,
            "deaths": datadec.stats[1].value,
            "in-game-hours": (datadec.stats[2].value / 60) / 60,
            "headshot-kills": datadec.stats[24].value,
            "total-wins": datadec.stats[5].value,
            "total-damage": datadec.stats[6].value
        }
        callback(stats);
    });
}

function getUserInfo(steamid,callback) {
    var apik = 'B26B620482C987680D005B925374ED9E';
    var url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apik + '&steamids=' + steamid + '&format=json';
    request({
        url: url,
        json: true
    }, function(error, response, body){
        if(!error && response.statusCode === 200){
            callback(null, body);
        } else if (error) {
            getUserInfo(steamid,callback);
        }
    });
}

function getStatsForSteamId(steamid, callback) {
    var apik = 'B26B620482C987680D005B925374ED9E';
    var url = 'https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=' + apik + '&steamid=' + steamid;
    request({
        url: url,
        json: true
    }, function(error, response, body){
        if (!error && response.statusCode === 200) {
            callback(null, body);
        } else if (error) {
            getStatsForSteamId(steamid, callback);
        }
    });
}

module.exports = {
    getUserName : getUserName,
    getUserPicture : getUserPicture,
    getUserInfo : getUserInfo,
    getStatsForSteamId : getStatsForSteamId,
    getImportantStats : getImportantStats
}
