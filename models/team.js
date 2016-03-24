var connection = require('../connection.js');
var userinfo = require('../userinfo.js');
var appjs = require('../app.js');

function Team() {
	this.get = function(teamobj, res){
    connection.connect(function(err, con) {
    	checkConnection(err);
	    if(teamobj.teamid == 'all'){
	    	con.query('select * from teams', function(err, result) {
			    con.release();
			    console.log("Disconnected from database")
			    res.send({status: "success", message: "All goladder teams", results: result});
	   		});
	    }else{
	    	con.query('select * from teams where teamid="' + teamobj.teamid + '"', function(err, result) {
			    con.release();
			    console.log("Disconnected from database")
			    if(result == ''){
			    	res.send({status: "Team not found"})
			    }else{
						console.log(result)
          	res.send({
          		status: "Success",
          		message: "User found",
          		results: result
          	});
			    }
	   		});
	    }
  	});
	}
	this.create = function(teamobj, res){
	    connection.connect(function(err, con) {
	      checkConnection(err);
	      	con.query('select teamid from teams where teamid="' + teamobj.teamid + '"', function(err,result){
	      		console.log(result)
		      		if(result == ''){
								console.log(teamobj)
		      			con.query('insert into team set ?', teamobj, function(err, result) {
					        con.release();
					        console.log("Disconnected from database")
					        if(err) {
					        	res.send({status: 1, message: 'User creation failed'});
					        }else{
					        	res.send({status: 0, message: 'User created successfully'});
					        }
				      	});
		      		}else{
		      			console.log(userobj.steamid);
				      	con.query('update users set lastonline=CURRENT_TIMESTAMP where steamid="' + userobj.steamid + '"', function(err, result) {
						    console.log(result)
						    if (err) {
						  		res.send({status: 1, message: 'User update online status failed'});
						  		console.log(err)
						    }else{
									userinfo.getUserName(userobj.steamid, function(name){
										con.query('update users set lastusername="' + name + '" where steamid="' + userobj.steamid + '"', function(err, result) {
											if (err) {
									  		res.send({status: 1, message: 'User update online status failed'});
									  		console.log(err)
									    }else{
												res.send({status: 0, message: 'User stati updated successfully'});
											}
										});
									});
						  	}
				  		});
	      		}
	      	});
	    	});
  	}


  	this.update = function(userobj, res) {
			console.log(userobj)
			connection.connect(function(err, con) {
			  	checkConnection(err);
			  	console.log(userobj.steamid)
			  	con.query('update users set ? where steamid="?"', [userobj, userobj.steamid], function(err, result) {
				    con.release();
				    console.log("Disconnected from database")
				    if (err) {
				  		res.send({status: 1, message: 'User update failed'});
				  		console.log(err)
				    }else{
							res.send({status: 0, message: 'User updated successfully'});
				    }
			  	});
			});
  	};
  	this.delete = function(userobj, res) {
	    connection.connect(function(err, con) {
	    	checkConnection(err);
			con.query('delete from users where steamid=?', [userobj.steamid], function(err, result) {
				con.release();
				console.log("Disconnected from database")
				if (err) {
					res.send({status: 1, message: 'Failed to delete user'});
				} else {
					res.send({status: 0, message: 'Deleted successfully user'});
				}
			});
	    });
  	};
  	function checkConnection(err){
  		if(err){
	   		console.log("Failed to connect to database")
	    }else{
	   		console.log("Connected to database")
	    }
  	}
}
module.exports = new Team();
