Butler
======

A node.js bot to assist you in Minecraft tasks. Butler currently can accept commands to travel to your location and will be able to automatically find nearby ores and mine them.

## Masters

Butler will only listen for commands from approved bot masters. These can be changed in the `botMasters` array in `bot.js` 

## Commands

### !assist
> Go to a players position.  
> !assist [Player_Name]

### !mine
> Mine specified ores in specified amounts.  
> !mine [Ore] [Amount]  
> If no amount is specified Butler will mine until the `!stop` command is issued. 

### !bring 
> Bring a block to the user issuing the command.  
> !bring [Block] [Amount]

### !inv or !inventory
> List the items in Butler's inventory.

### !day
> Set the time in the current world to `day`.

### !night
> Set the time in the current world to `night`.

### !rain
> Make it rain.

### !sun
> Turn the weather to sun.