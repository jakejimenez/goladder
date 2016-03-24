var connection = require('../connection.js');
var userinfo = require('../userinfo.js');
var appjs = require('../app.js');

function User() {
	this.get = function(userobj, res){
    connection.connect(function(err, con) {
    	checkConnection(err);
	    if(userobj.steamid == 'all'){
	    	con.query('select * from users', function(err, result) {
			    con.release();
			    console.log("Disconnected from database")
			    res.send({status: "success", message: "All goladder users", results: result});
	   		});
	    }else{
	    	con.query('select * from users where steamid="' + userobj.steamid + '"', function(err, result) {
			    con.release();
			    console.log("Disconnected from database")
			    if(result == ''){
			    	res.send({status: "User not found"})
			    }else{
			    	var name;
			    	var picture;
			    	userinfo.getUserName(userobj.steamid, function(name){
	            userinfo.getUserPicture(userobj.steamid, function(picture){
	            	result[0]['name'] = name
	            	result[0]['picture'] = picture
	            	var renderjson = ({status: "Success", message: "User found", results: result});
	            	console.log(renderjson)
	            	res.send({
	            		status: "Success",
	            		message: "User found",
	            		results: result
	            	});
	            });
		        });
			    }
	   		});
	    }
  	});
	}
	this.create = function(userobj, res){
	    connection.connect(function(err, con) {
	      checkConnection(err);
	      	con.query('select steamid from users where steamid="' + userobj.steamid + '"', function(err,result){
	      		console.log(result)
		      		if(result == ''){
		      			con.query('insert into users set ?', userobj, function(err, result) {
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

module.exports = new User();
