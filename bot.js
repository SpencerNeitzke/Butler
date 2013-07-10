var mineflayer = require("mineflayer");
var radarPlugin = require("mineflayer-radar")(mineflayer);
var navigatePlugin = require("mineflayer-navigate")(mineflayer);
var scaffoldPlugin = require("mineflayer-scaffold")(mineflayer);
var blockFinderPlugin = require("mineflayer-blockfinder")(mineflayer);
var bot = mineflayer.createBot({ username: "Butler", host: "127.0.0.1" });
var radarOpt = {
	host:	"0.0.0.0",
	port: 5544
};

//radarPlugin(bot, radarOpt);
navigatePlugin(bot);
scaffoldPlugin(bot);
blockFinderPlugin(bot);

bot.navigate.blocksToAvoid[132] = true; // Tripwire
bot.navigate.blocksToAvoid[59] = false; // Crops

bot.on("chat", function(username, message) {
	msg = message.split(" ");
	if (username === bot.username) return;
	if(msg[0] === "!comeHither") {
		try { var target = bot.players[username].entity.position; }
		catch(err) { 
			bot.chat("I'm sorry to inform you that you are out of my reach.") 
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
		var block = msg[1];
		var radius = 256;
		if(msg[2]) radius = msg[2];
		
		function mineOre(block, radius=256, count=5) {
			bot.findBlock({
				point: bot.entity.position,
				matching: parseInt(block);
				maxDistance: radius,
				count: count,
			}, function(err, blockPoints) {
				if(err) return bot.chat("Could not find any "+block+" within "+radius+" blocks of my position.");
				if(blockPoints.length) {
					var block = blockPoints[0];
					bot.chat("Found "+block["displayName"]+"")
				}
			});
		}
		
		setInterval(function() {
			console.log("Started");
			bot.findBlock({
				point: bot.entity.position,
				matching: parseInt(block),
				maxDistance: radius,
				count: 5,
			}, function(err, blockPoints) {
				if(err) return bot.chat("Could not find any "+block+" within "+radius+" blocks.");
				if(blockPoints.length) {
					var block = blockPoints[0];
					bot.chat("Found "+block["displayName"]+" at "+block["position"]+".");
					bot.scaffold.to(block["position"], function(err) {
						if(err) {
							console.log(err);
						}
						else {
							bot.chat(block["displayName"]+" mined.");
							bot.findBlock({
								point: bot.entity.position,
								matching: parseInt(block),
								maxDistance: 10,
								count: 1
							}, function(err, blockPoints) {
								var block = blockPoints[
							});
						}
					});
				} else {
					return bot.chat("Could not find any "+block+" within "+radius+" blocks.");
				}
			});
			console.log("Looped");
		}, 5000);
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