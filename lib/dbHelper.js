var sql = require('sqlite3').verbose(),
    http = require('http');

exports.loadConfig = function (cb) {
  var db = new sql.Database('mittens.db');

  db.all("SELECT * FROM sqlite_master WHERE type='table'" ,function (err, settings){
    if(!settings[0]) {
      console.log('Table Doesn\'t Exist: I\'m going to create it.');
      db.run("CREATE TABLE providers (name TEXT,host TEXT,port TEXT,api TEXT,active TEXT,alias TEXT)");
    } else {
      db.all("SELECT rowid AS id, * FROM providers", function (err, providers){
        cb({'settings': settings, 'providers':providers}); //bring config out into main scope 
      });
    }
  });
};

exports.initDb = function () {
  var db = new sql.Database('mittens.db');
  console.log('initDb');
  db.run("CREATE TABLE providers (name TEXT, host TEXT, port TEXT, api TEXT)");
  //db.run("CREATE TABLE settings (port TEXT)");
  db.close();
}

exports.rmProvider = function (name, cb) {
  var db = new sql.Database('mittens.db');
  db.run("DELETE FROM providers WHERE name = (?)",name);
  console.log('deleted: ' + name);
  db.close();
}

exports.listProviders = function() {
  var db = new sql.Database('mittens.db');
  console.log('listProviders');
  db.all("SELECT rowid AS id, * FROM providers", function (err, rows){
    console.log(rows);
  });
  db.close();
}

exports.addProviders = function (conf) {
  var db = new sql.Database('mittens.db');
  for ( var provider in conf ) {
    console.log(conf[provider]);
    var item = conf[provider];
     
    if (   item.name != '' 
        && item.host != '' 
        && item.port != '' 
        && item.api != ''
        && item.active != '') {
      
      console.log('Adding to DB');
      db.run("INSERT INTO providers VALUES (?,?,?,?,?,?)",
        [item.name,item.host,item.port,item.api,item.active,item.alias]);
    }
  }
  db.close();
}

exports.addProvider = function (providers, item) {
  var db = new sql.Database('mittens.db');
  console.log('dbhelper addProvider');
  http.request(providers[item.name].check(item), function (resp) {
    var str = '';
    resp.on('data', function (chunk) { str += chunk; });
    resp.on('end', function () {
      if (providers[item.name].checkParse(str)) {
        console.log('Adding to DB');
        db.run("INSERT INTO providers VALUES (?,?,?,?)",[item.name,item.host,item.port,item.api]);
        db.close();
      }
    });
  }).end();
}

exports.closeDb = function () {
  db.close();
  console.log('DB Closed.');
}

