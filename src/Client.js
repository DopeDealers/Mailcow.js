const w = require('axios');
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
    
    /** <Mailcow>.getUserMailBox(<user>); // GET
     * @param  {String} user User param
     * @returns {JSON} Unformated JSON data from API
     * @example let user = await new Mailcow("https://mail.yourdomain.org/", {readOnlyKey: "XXXX-XXXX-XXXX-XXXX", writeKey: "XXXX-XXXX-XXXX-XXXX"})
     * let apiData = await user.getUserMailBox("admin@cyci.org")
     */
    async getUserMailBox(user) {
        if (!user || !user.length) user = "all"
        const unformData = await w({url: `${this._baseurl}/api/v1/get/mailbox/${user}`, headers: this._headers, method: 'get'})
        return unformData.data;
    }
    /** <Mailcow>.getDomain(<domain>); // GET
     * @param  {String} domain String domain param
     * @returns {JSON} Unformated JSON data from API
     * @example let domain = await new Mailcow("https://mail.yourdomain.org/", {readOnlyKey: "XXXX-XXXX-XXXX-XXXX", writeKey: "XXXX-XXXX-XXXX-XXXX"})
     * let apiData = await domain.addMailBox("yourdomain.org")
     */
    async getDomain(domain) {
        if (!domain || !domain.length) domain = "all"
        const unformData = await w({url: `${this._baseurl}/api/v1/get/domain/${domain}`, headers: this._headers, method: 'get'})
        return unformData.data;
    }
    /** <Mailcow>.addMailBox(<user>); // POST
     * @param  {Object} domain Object domain param
     * @returns {JSON} Unformated JSON data from API
     * @example let domain = await new Mailcow("https://mail.yourdomain.org/", {readOnlyKey: "XXXX-XXXX-XXXX-XXXX", writeKey: "XXXX-XXXX-XXXX-XXXX"})
     * let apiData = await domain.addMailBox({})
     * @borrows https://github.com/firstdorsal/mailcow-api/blob/master/index.js#L157
     */
     async addDomain(domain) {
        if (!domain || Object.getPrototypeOf(domain) !== Object.prototype) throw new Error("No domain Object schema or no param provided.");
        this._headers['Content-Type'] == "application/json";
        if (!domain.domain.match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');
        let domainWhois = this.checkAvailable(domain.domain);
        if (!domainWhois) throw new Error('The domain provided was not registered on the WHOIS database.')
        domain.active = typeof (domain.active) == 'undefined' ? 1 : domain.active;
        domain.aliases = typeof (domain.aliases) == 'undefined' ? 400 : domain.aliases;
        domain.defquota = typeof (domain.defquota) == 'undefined' ? 3072 : domain.defquota;
        domain.mailboxes = typeof (domain.mailboxes) == 'undefined' ? 10 : domain.mailboxes;
        domain.maxquota = typeof (domain.maxquota) == 'undefined' ? 10240 : domain.maxquota;
        domain.quota = typeof (domain.quota) == 'undefined' ? 10240 : domain.quota;
        const unformData = await w({url: `${this._baseurl}/api/v1/add/mailbox/${user}`, headers: this._headers, method: 'post', body: JSON.stringify(domain)})
        return unformData.data;
    }

    /**
     * @private
     * @param {String} url
     */
     async checkAvailable(url) {
        if (!url) throw new Error('No domain name provided <Mailcow>.checkAvailable()');
            const domainWhois = await require('whoiser').domain(url)
            if (domainWhois['whois.pir.org'].text[0] == 'URL of the ICANN Whois Inaccuracy Complaint Form https://www.icann.org/wicf/)') return true;
            else return false;
    }
}

module.exports = Mailcow;
