var mineflayer = require("mineflayer");
var radarPlugin = require("mineflayer-radar")(mineflayer);
var navigatePlugin = require("mineflayer-navigate")(mineflayer);
var scaffoldPlugin = require("mineflayer-scaffold")(mineflayer);
var blockFinderPlugin = require("mineflayer-blockfinder")(mineflayer);
var bot = mineflayer.createBot({ username: "", password: "", host: "127.0.0.1", port: 25566});
var radarOpt = {
	host: "localhost",
	port: 5544
};

radarPlugin(bot, radarOpt);
navigatePlugin(bot);
scaffoldPlugin(bot);
blockFinderPlugin(bot);

var mining = false;
var botName = "YourButler";
var botMaster = ["SpencerNeitzke", "NickFrey"];

bot.on("spawn", function() {
	setTimeout(function() {
		bot.chat("/clear "+botName);
		bot.chat("/give "+botName+" 276 5");
		bot.chat("/give "+botName+" 277 5");
		bot.chat("/give "+botName+" 278 5");
		bot.chat("/give "+botName+" 279 5");
		bot.chat("/give "+botName+" 1 64");
		bot.chat("/give "+botName+" 1 64");
		bot.chat("/give "+botName+" 1 64");
		bot.chat("/give "+botName+" 1 64");
	}, 1000)
});

bot.on("death", function() {
	setTimeout(function() {
		bot.chat("/tp "+botName+" -38 64 -153")
		bot.chat("/give "+botName+" 276 5");
		bot.chat("/give "+botName+" 277 5");
		bot.chat("/give "+botName+" 278 5");
		bot.chat("/give "+botName+" 279 5");
		bot.chat("/give "+botName+" 1 64");
		bot.chat("/give "+botName+" 1 64");
		bot.chat("/give "+botName+" 1 64");
		bot.chat("/give "+botName+" 1 64");
	}, 5000)
});

bot.on("health", function() {
	console.log("Health: " + bot.health);
});

bot.on("chat", function(username, message) {
	msg = message.split(" ");
	console.log(botMaster.indexOf(username));
	if (botMaster.indexOf(username) == -1) return;
	if(msg[0] === "!comeHither") {
		try { var target = bot.players[username].entity.position; }
		catch(err) { 
			bot.chat("I'm sorry to inform you that you are out of my reach. I am going to initiate teleportation.");
			bot.chat("/tp "+username); 
			return;
		}
		if(msg[1] == "no") {
			try {
			  bot.navigate.to(target);
			} catch(err) { bot.chat("I'm sorry to inform you that you are out of my reach."); }
		} else {
			bot.scaffold.to(target, function(err) {
				if(err) console.log(err);
				else bot.chat("Yes?");
			});
		}
	} else if(msg[0] === "!stop") {
	  	bot.navigate.stop();
	} else if(msg[0] === "!assist") {
		var user = msg[1];
		var target = bot.players[user].entity.position;
		if(msg[2] == "no") {
			try {
				bot.navigate.to(target);
			} catch(err) { bot.chat("Target is too far away.") }
		} else {
			bot.scaffold.to(target, function(err) {
				if(err) console.log(err);
				else bot.chat("At your service, sir.");
			});
		}
	} else if(msg[0] === "!mine") {
		bot.chat("Yes, sir.")
		mine(msg[1], msg[2], username)
	} else if(msg[0] === "!bring") {
		var block;
		var amount;
		
		if(!msg[1]) return bot.chat("Please specify a block for me to bring you, sir.");
		if(msg[2]) amount = parseInt(msg[2]);
		block = msg[1].toString();
		
		bringBlock(blockTradeID(block), amount, username);
	} else if(msg[0] === "!inventory" || msg[0] === "!inv") {
		var items = {};
		bot.inventory.items().forEach(function(item) {
			if(items[item.displayName] === undefined) items[item.displayName] = 0;
			if(items[item.displayName]) items[item.displayName]["count"] = parseInt(items[item.displayName]["count"]) + parseInt(item.count);
			else items[item.displayName] = { "count": item.count, "id": item.type};
		});
		
		console.log(items);
		
		var fullStr;
		bot.chat("Current Inventory:");
		for(i in items) {
			bot.chat(i + " ["+items[i].id+"]" + ":     " + items[i].count + " blocks")
		}	
	} else if(msg[0] === "!stahp") {
		bot.scaffold.stop();
		mining = false;
	} else if(msg[0] === "!day") {
		bot.chat("I shall turn the darkness into day for you, sir.");
		bot.chat("/time set day");
	} else if(msg[0] === "!night") {
		bot.chat("I shall lift the moon from the horizon personally, sir.");
		bot.chat("/time set night");
	} else if(msg[0] === "!sun") {
		if(!bot.isRaining) return bot.chat("Sir, I don't believe it's raining.");
		bot.chat("/toggledownfall");
	} else if(msg[0] === "!rain") {
		if(bot.isRaining) return bot.chat("Sir, it's already raining.");
		bot.chat("/toggledownfall");
	} else if(msg[0] === "!yes") {
		bot.emit("userResponse", "yes");
	} else if(msg[0] === "!no") {
		bot.emit("userResponse", "no");
	} else if(msg[0] === "!amount") {
		bot.emit("userResponse", msg[1]);
	}
});

bot.navigate.on("pathFound", function (path) {
  bot.chat("Path found. I can get there in " + path.length + " moves.");
});

bot.navigate.on("cannotFind", function (closestPath) {
  bot.chat("Unable to find path. Getting as close as possible.");
  bot.navigate.walk(closestPath);
});

bot.navigate.on("interrupted", function() {
  bot.chat("Stopping.");
});

function bringBlock(block, amt, username) {	
	var items = {};
	bot.inventory.items().forEach(function(item) {
		if(items[item.type.toString()] === undefined) items[item.type.toString()] = 0;
		items[item.type.toString()] += item.count;
	});
	
	var inStock = false;
	for(i in items) {
		if(i == block) {
			inStock = true;
			if(amt) {
				if(items[i] >= amt) {
					var target = bot.players[username].entity.position.offset(1, 0, 0);
					bot.chat("I will be there in a moment.");
					bot.scaffold.to(target, function(err) {
						if(err) {
							bot.chat("Could not navigate to your position, please move closer.");
						} else {
							var lookPos = bot.players[username].entity.position;
							bot.lookAt(lookPos, true);
							bot.toss(parseInt(block), null, parseInt(amt), function() {
								bot.chat("There you go, sir.");
							});
						}
					});
				} else if(items[i] < amt) {
					bot.chat("I do apologize, sir, but I only have "+items[i]+" of that item. Would you like me to mine more?");
					bot.chat("!yes or !no");
					bot.on("chat", function(username, message) {
						if(message === "!yes") {
							mine(block, amt - items[i], username);
						} else if (message === "!no") {
							var target = bot.players[username].entity.position;
							bot.scaffold.to(target, function(err) {
								if(err) {
									bot.chat("Could not navigate to your position, please move closer.");
								} else {
									bot.chat("There you go, sir.");
								}
							});
						}
					});
				}
			} else {
				var target = bot.players[username].entity.position;
				bot.chat("I will be there in a moment.");
				bot.scaffold.to(target, function(err) {
					if(err) {
						bot.chat("Could not navigate to your position, please move closer.");
					} else {
						var lookPos = bot.players[username].entity.position;
						bot.lookAt(lookPos, true);
					
						bot.toss(parseInt(block), null, parseInt(amt), function() {
							bot.chat("There you go, sir.");
						});
					}
				});
			}
		}
	} 
	
	if(!inStock) {
		console.log("not in stock");
		bot.chat("I do apologize, sir, but I don't have any of that item. Would you like me to mine some?");
		bot.chat("!yes or !no")
		bot.on("userResponse", function(res) {
			if(res === "yes") {
				bot.chat("How many would you like? !amount 10");
				bot.on("userResponse", function(res) {
					console.log(res);
					if(!parseInt(res)===+(parseInt(res)) && !(parseInt(res))===(parseInt(res)|0)) return bot.chat("Invalid input.");
					mine(blockMineID(block), res, username, function() {
						console.log("Hello");
						bot.scaffold.resume();
						bot.scaffold.to(bot.players[username].entity.position.offset(1, 0, 0), function(err) {
							console.log("sdfdf");
							if(err) {
								bot.chat("Could not navigate to your position, please move closer.");
								console.log(err);
							} else {
								console.log("sdf");
							
								var lookPos = bot.players[username].entity.position;
								bot.lookAt(lookPos, true);
							
								console.log("here");
								console.log(parseInt(blockTradeID(block)));
								bot.toss(parseInt(blockTradeID(block)), null, parseInt(res), function() {
									bot.chat("There you go, sir.");
								});
							}
						});
					});
				});
			} else if(res === "no") {
				var target = bot.players[username].entity.position;
				bot.scaffold.to(target, function(err) {
					if(err) {
						bot.chat("Could not navigate to your position, please move closer.");
					} else {
						bot.chat("I have arrived.");
					}
				});
			}
		});
	}
}

function mine(block, amount, username, callback) {
	console.log("Started mining");
	var foundBlocks = 0;
	var requestedBlocks = parseInt(amount);
	console.log("Block: "+block+", Amount: "+amount);

	function hasEnoughBlocks() {
		if(requestedBlocks && requestedBlocks == foundBlocks) {
			bot.chat("Mission complete, sir. "+foundBlocks+" were found as requested.");
			setTimeout(function() {
				if(callback) callback();
				return true;
			}, 1000);
		}
		return false;
	}
	
	function processError(err) {
		if(err.code == "stop") {
			bot.chat("Stopped mining.");
			return true;
		}
		return false;
	}
	
	var prevCoor = bot.players[username].entity.position;		
	mineOre(block, 256, 1, function() {
		bot.scaffold.stop();
		console.log("MineOre done");
	});
	
	function mineOre(blockID, radius, count, cBack) {
		try {
			bot.findBlock({
				point: bot.entity.position,
				matching: parseInt(blockID),
				maxDistance: radius,
				count: count,
			}, function(err, blockPoints) {
				if(hasEnoughBlocks()) {
					if(cBack) cBack();
					return false;
				}
				if(err) return console.log("Could not find any "+block+" within "+radius+" blocks of my position.");
				if(blockPoints.length == 0) {
					console.log("Could not find nearby blocks, expanding range to "+(radius*2)+"...");
					setTimeout(function() {mineOre(blockID, radius*2, 1);}, 10);
					return;
				}
				
				var block = blockPoints[0];
				prevCoor = block["position"];
				
				var output = bot.scaffold.to(block["position"], function(err) {
					if(err) {
						console.log(err);
						if(!processError(err)) {
							console.log("Danger ahead (scaffold error), going to previous coordinates.");
							bot.scaffold.stop();
							bot.navigate.stop();
							bot.scaffold.to(prevCoor, function() {
								if(err) {
									console.log("Error going to prevCoor");
								}
							});
						}
						return;
					} else {
						foundBlocks++;
						var findNearbyBlocks = function() {
							bot.findBlock({
								point: bot.entity.position,
								matching: parseInt(blockID),
								maxDistance: 5,
								count: 1,
							}, function(err, nearbyBlockPoints) {
								if(hasEnoughBlocks()) {
									if(cBack) cBack();
									return false;	
								}
								if(err || (nearbyBlockPoints.length == 0)) {
									console.log("Could not find nearby blocks, expanding range...");
									setTimeout(function() {mineOre(blockID, 256, 1);}, 10);
									return;
								}
								
								var nearbyBlock = nearbyBlockPoints[0];
								foundBlocks++;
								
								setTimeout(function() {
								bot.scaffold.to(nearbyBlock["position"], function(err) {
									if(err) {
										if(!processError(err)) {
											console.log("Could not navigate to that position. Expanding range...");
											mineOre(blockID, radius, count);
										}	
									} else {
										findNearbyBlocks();
									}
								});
								}, 100);
							});
						};
						findNearbyBlocks();
					}
				});
			});
		} catch(err) {
			console.log("Caught error, restarting.");
			console.log(err);
			
			bot.scaffold.stop();
			mineOre(blockID, radius, count);
		}
	}
	return;
}

function blockMineID(block) {
	if(block == "263") block = "16";        // Coal
	if(block == "264") block = "56";        // Diamond
	if(block == "351:4") block = "21";      // Lapis Lazuli
	if(block == "331") block = "73";        // Redstone
	return block;
}

function blockTradeID(block) {
	if(block == "16") block = "263";        // Coal
	if(block == "56") block = "264";        // Diamond
	if(block == "21") block = "351:4";      // Lapis Lazuli
	if(block == "73") block = "331";        // Redstone
	return block;
}