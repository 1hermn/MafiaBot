const Discord = require('discord.js');
const client = new Discord.Client();
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
//хостить бд где-нибудь
db.set({count : 0})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.cache.forEach((guild) => {
    var guild_db = `guild_`+guild.id
    db.set(guild_db, []).write();
    var i = 0;
    guild.channels.cache.forEach((channel) => {
      if(channel.type == "voice"){
      db.get(guild_db).push({name: channel.name, id: channel.id, type_id: i}).write()
      i++;
    }
    })
  })
});

function makeRand(num) {
    var usedNumbers = [num--];
    !function f() {
        var i = Math.round(Math.random() * usedNumbers.length);
        usedNumbers.splice(i,0,num--);
        num && f()
    }();
    return usedNumbers;
}

function get_channel_id(args, msg){
  let channel = Number(args[1]);
  var guild_db = `guild_`+msg.guild.id
    db.read()
    let value = db.get(guild_db).find({type_id: channel}).value()
    if(value != undefined){
      return value.id
    }else {
      return undefined
    }
}

client.on('message', async msg => { //сюда guild
  //let admin = msg.guild.roles.cache.find(r => r.name === "Admin")
  if (msg.author.bot) return
  if (msg.content.startsWith('.generate')) { //в будущем сделать выбор каналов
    args = msg.content.split(" ");
    //.generate VOICE_INDEX maf(кол-во) 0/1(любовница) @ведущего
    if(!args[1] || !args[2] || !args[3] || !args[4]){
      msg.reply("Не все аргументы найдены.\nИспользуйте команду:\n```.generate VoiceId maf(кол-во) 0/1(любовница) Idведущего```\nПример:```.generate 332442194042552322 2 1 @1hermn```")
      return
    }
    var master_id
    msg.mentions.users.forEach((user) => {
     master_id  = user.id
    })
    msg.reply("Генерация ролей начата. Ведущим назначен <@!"+master_id + ">")
    console.log(master_id)
    var players = [];
    channel_id = get_channel_id(args, msg)
    msg.channel.send(`Комната: <#${channel_id}>`)
    msg.guild.channels.cache.get(channel_id).members.forEach((member) => {
      if(member.user.id != args[4]);
      players.push(member.user.id)
    })
    console.log(players)
        var roles = [];
    for(i = 0; i < args[2]; i++){
      roles.push("Мафия")
    }
    for(i = 0; i < args[3]; i++){
      roles.push("любовница")
    }
    roles.push("Комиссар","Доктор")
    var other = Number(args[2]) + Number(args[3]) + 2;
    var peacefull_count = players.length - other

    for(i = 0; i <= peacefull_count; i++){
      roles.push("Мирный житель")
    }

    console.log(peacefull_count)
    console.log(roles)
    var rand_num_arr = makeRand(players.length)
    for(i = 0; i < players.length; i++){
      dm = await msg.guild.members.cache.get(players[i]).createDM()
      player_username = msg.guild.members.cache.get(players[i]).user.username
      player_name = msg.guild.members.cache.get(players[i]).nickname
      master_dm = await msg.guild.members.cache.get(master).createDM()
      master_dm.send("Игрок: " + player_username + "/" + player_name + "\nРоль: " + roles[rand_num_arr[i] - 1])
      dm.send("Привет. Вам была назначена роль " + roles[rand_num_arr[i] - 1])
    }
    console.log(rand_num_arr)    
  }
  if(msg.content === '.showdb'){
    var guild_db = `guild_`+msg.guild.id
      let base = db.get(guild_db).value()
      for(var i = 0; i < base.length; i++){
        msg.reply(`${base[i].name}(${base[i].id}) индекс ${base[i].type_id}`)
      }
    }
   if(msg.content === '.help'){
     msg.channel.send(`
      Перед началом игры, введите команду \`.showdb\`, которая покажет добавленные комнаты
      \nДалее введите .generate [INDEX] [кол-во мафий] [0/1 любовница] @ведущий
      \nПример: \`\`\`.generate 0 2 1 @1hermn \`\`\`.
      \nБот сгенерирует роли и отправит участникам. Также отправит роли ведущему.
      `)
   }
});


client.login(process.env.token);