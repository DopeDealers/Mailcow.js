const w = require('wumpfetch');
const isURL = require('./utils/isUrl');


class Mailcow {
    /**Mailcow.js constructor
     * @param {String} baseurl base url for https://mail.yourdomain.org/ with a mailcow installation
     * @param {Object} options Additional options for your API keys and warnings
     * @param {String} options.readOnlyKey Your mailcow Read Only API Key
     * @param {String} options.writeKey Your mailcow Read and Write API Key
     * @example const mailcow = new Mailcow("https://mail.yourdomain.org/", {readOnlyKey: "XXXX-XXXX-XXXX-XXXX", writeKey: "XXXX-XXXX-XXXX-XXXX"});
     * 
     */
    constructor(baseurl, {readOnlyKey = "", writeKey = "", noOutPutConsole = false} = {}) {
        ////{readOnlyKey = "", writeKey = "", noOutPutConsole = false} = {}
        this._baseurl = baseurl;
        this.options = {readOnlyKey, writeKey}
        if (!this._baseurl || !isURL(this._baseurl)) throw new Error("Please provide a baseurl, can be found by going to https://mail.yourdomain.org/ with a mailcow installation.");
        if (!this.options.readOnlyKey || !this.options.writeKey) throw new Error("Please provide both a Read And Write API key to use with this wrapper can be found on your mailcow Admin Panel.");
        this._headers = {
            'X-Api-Key': this.options.writeKey
        }
        
    }
    async getUser(user) {
        if (!user || !user.length) user = "all"
        // user should be user@domain.tld
        const r = await w(`${this._baseurl}/api/v1/get/mailbox/${user}`, {
            method: 'GET',
            headers: this.headers,
            
        }).send();
        console.log(r);
        console.log(`${this._baseurl}/api/v1/get/mailbox/${user}`);
        return r;
    }
}
(async() =>{
    const e = new Mailcow("https://mail.cyci.org", {writeKey: "", readOnlyKey: ""});

    let ee = await e.getUser("admin@cyci.org")
    console.log(ee);
})
