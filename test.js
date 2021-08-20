const Mailcow = require("./src/Client")

async function ee() {
    const e = new Mailcow("https://mail.cyci.org", {writeKey: "009290-FCE3DD-7107CC-838ADB-AA3944", readOnlyKey: "009290-FCE3DD-7107CC-838ADB-AA3944"});
    let test = await e.checkAvailable('cyaeefatqwegtwrgtyci.org');

    if (!test) return console.log('eeee');
    
    console.log("gets here");
}

ee()