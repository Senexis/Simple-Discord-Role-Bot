# Simple Discord Role Bot
A quickly-made custom role Discord bot that adds role based on presence. Provided as-is: horribly inefficient with tons of potential for improvements and clean-up.

## Usage
When it's set up (the generic NodeJS type of setup), you can just invite it to the server with `Administrator` permissions and then it should automatically add roles to people playing games.
Some Application IDs are blacklisted, see `blacklist.js`, and new IDs can simply be added to that array to block those applications from being added as roles.
Please note that in order to complete setup, you will need to replace any occurance of `FILL_ME` with the relevant information such as the token or the owner's ID.

This bot has no commands, no configuration, nothing, except for anything Commando. Why does this use Commando? No clue. I set this up in a hurry. All this could and should probably be condensed to a few lines if you plan to use this at all.
There's a lot of potential for improvements here, feel free to use any of this, or none of it. This is just a quick little hobby bot, not intended to be used for big servers or anything.

## License
Just grab what you need and go forth. Don't sue me if this code breaks your server though, that's on you.
