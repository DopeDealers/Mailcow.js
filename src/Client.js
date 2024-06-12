const axios = require('axios');
const isURL = require('./utils/isUrl');
const { mailcowjsOptions } = require('./Constants');

class Mailcow {
    /**
     * Mailcow.js constructor
     * @param {String} baseurl - Base URL for Mailcow installation
     * @param {Object} options - Additional options for API keys and warnings
     * @param {String} options.readOnlyKey - Mailcow Read Only API Key
     * @param {String} options.writeKey - Mailcow Read and Write API Key
     * @example 
     * const mailcow = new Mailcow("https://mail.yourdomain.org/", {readOnlyKey: "XXXX-XXXX-XXXX-XXXX", writeKey: "XXXX-XXXX-XXXX-XXXX"});
     */
    constructor(baseurl, options) {
        this._baseurl = baseurl;
        Object.defineProperty(this, 'options', { value: this.mergeDefault(mailcowjsOptions, options) });
        if (!this._baseurl || !isURL(this._baseurl)) throw new Error("Please provide a baseurl, can be found by going to https://mail.yourdomain.org/ with a mailcow installation.");
        if (!options.readOnlyKey || !options.writeKey) throw new Error("Please provide both a Read And Write API key to use with this wrapper can be found on your mailcow Admin Panel.");
        this._headers = {
            'X-Api-Key': options.writeKey,
            'Content-Type': 'application/json'
        };
    }

    async request(config) {
        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error(`Error: ${error.response ? error.response.statusText : error.message}`);
            if (error.response && error.response.status >= 500) {
                console.log('Retrying request...');
                return this.retryRequest(config);
            }
            throw error;
        }
    }

    async retryRequest(config, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios(config);
                return response.data;
            } catch (error) {
                if (i === retries - 1) throw error;
                console.log(`Retry ${i + 1}/${retries} failed: ${error.response ? error.response.statusText : error.message}`);
            }
        }
    }

    // Mailboxes
    /**
     * Get a user's mailbox
     * @param {String} user - User email
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async getUserMailBox(user) {
        return this.request({
            url: `${this._baseurl}/api/v1/get/mailbox/${user}`,
            headers: this._headers,
            method: 'get'
        });
    }

    /**
     * List all mailboxes
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async listMailboxes() {
        return this.request({
            url: `${this._baseurl}/api/v1/get/mailbox/all`,
            headers: this._headers,
            method: 'get'
        });
    }

    /**
     * Add a new mailbox
     * @param {Object} mailboxDetails - Details of the mailbox to be added
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async addMailbox(mailboxDetails) {
        // Validate domain format
        if (!mailboxDetails.domain.match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) {
            throw new Error('Invalid domain name format');
        }
    
        // Check if domain is registered on the WHOIS database
        const domainWhois = await this.checkAvailable(mailboxDetails.domain);
        if (!domainWhois) {
            throw new Error('The domain provided was not registered on the WHOIS database.');
        }
        
        mailboxDetails.active ??= 1;
        mailboxDetails.quota ??= 3072;
        mailboxDetails.force_pw_update ??= 1;
        mailboxDetails.tls_enforce_in ??= 1;
        mailboxDetails.tls_enforce_out ??= 1;
        mailboxDetails.tags ??= [];
    
        // Make API request to add mailbox
        return this.request({
            url: `${this._baseurl}/api/v1/add/mailbox`,
            headers: this._headers,
            method: 'post',
            data: mailboxDetails
        });
    }
    

    /**
     * Delete mailboxes
     * @param {Array<String>} mailboxes - List of mailboxes to be deleted
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async deleteMailbox(mailboxes) {
        return this.request({
            url: `${this._baseurl}/api/v1/delete/mailbox`,
            headers: this._headers,
            method: 'post',
            data: { items: mailboxes }
        });
    }

    // Domains
    /**
     * Get a domain
     * @param {String} domain - Domain name
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async getDomain(domain) {
        return this.request({
            url: `${this._baseurl}/api/v1/get/domain/${domain}`,
            headers: this._headers,
            method: 'get'
        });
    }

    /**
     * Add a new domain
     * @param {Object} domain - Domain details
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async addDomain(domain) {
        if (!domain.domain.match(/[A-Z-a-z0-9]+\.[A-Z-a-z0-9]+$/)) throw new Error('domain name is invalid');
        let domainWhois = await this.checkAvailable(domain.domain);
        if (!domainWhois) throw new Error('The domain provided was not registered on the WHOIS database.');
        
        domain.active ??= 1;
        domain.aliases ??= 400;
        domain.defquota ??= 3072;
        domain.mailboxes ??= 10;
        domain.maxquota ??= 10240;
        domain.quota ??= 10240;

        return this.request({
            url: `${this._baseurl}/api/v1/add/domain`,
            headers: this._headers,
            method: 'post',
            data: domain
        });
    }

    /**
     * Delete domains
     * @param {Array<String>} domains - List of domains to be deleted
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async deleteDomain(domains) {
        return this.request({
            url: `${this._baseurl}/api/v1/delete/domain`,
            headers: this._headers,
            method: 'post',
            data: { items: domains }
        });
    }

    // Aliases
    /**
     * Add a new alias
     * @param {Object} aliasDetails - Details of the alias to be added
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async addAlias(aliasDetails) {
        return this.request({
            url: `${this._baseurl}/api/v1/add/alias`,
            headers: this._headers,
            method: 'post',
            data: aliasDetails
        });
    }

    /**
     * Delete aliases
     * @param {Array<String>} aliases - List of aliases to be deleted
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async deleteAlias(aliases) {
        return this.request({
            url: `${this._baseurl}/api/v1/delete/alias`,
            headers: this._headers,
            method: 'post',
            data: { items: aliases }
        });
    }

    // Sync Jobs
    /**
     * Add a new sync job
     * @param {Object} syncJobDetails - Details of the sync job to be added
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async addSyncJob(syncJobDetails) {
        return this.request({
            url: `${this._baseurl}/api/v1/add/syncjob`,
            headers: this._headers,
            method: 'post',
            data: syncJobDetails
        });
    }

    /**
     * Delete sync jobs
     * @param {Array<String>} syncJobs - List of sync jobs to be deleted
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async deleteSyncJob(syncJobs) {
        return this.request({
            url: `${this._baseurl}/api/v1/delete/syncjob`,
            headers: this._headers,
            method: 'post',
            data: { items: syncJobs }
        });
    }

    /**
     * Edit sync jobs
     * @param {Array<String>} syncJobs
     * @returns {Promise<JSON>} - Unformatted JSON data from the API 
     */
    async editSyncJob(syncJobs) {
        return this.request({
            url: `${this._baseurl}/api/v1/delete/syncjob`,
            headers: this._headers,
            method: 'post',
            data: { items: syncJobs }
        });
    }

    /**
     * Get all current sync jobs
     * @returns {Promise<JSON>} - Unformatted JSON data from the API 
     */
    async getAllSyncJobs() {
        return this.request({
            url: `${this._baseurl}/api/v1/get/syncjobs/all/no_log`,
            headers: this._headers,
            method: 'get'
        })
    }

    // Forwarding Hosts
    /**
     * Add a new forwarding host
     * @param {Object} fwdHostDetails - Details of the forwarding host to be added
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async addForwardingHost(fwdHostDetails) {
        return this.request({
            url: `${this._baseurl}/api/v1/add/fwdhost`,
            headers: this._headers,
            method: 'post',
            data: fwdHostDetails
        });
    }

    /**
     * Delete forwarding hosts
     * @param {Array<String>} fwdHosts - List of forwarding hosts to be deleted
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async deleteForwardingHost(fwdHosts) {
        return this.request({
            url: `${this._baseurl}/api/v1/delete/fwdhost`,
            headers: this._headers,
            method: 'post',
            data: { items: fwdHosts }
        });
    }

    /**
     * Get all forwarding hosts.
     * @returns {Promise<JSON>}
     */
    async getForwardingHosts() {
        return this.request({
            url: `${this._baseurl}/api/v1/fwdhost/all`,
            headers: this._headers,
            method: 'get'
        })
    }

    // Logs
    /**
     * Get logs
     * @param {String} [type=sogo] - Type of logs to retrieve 
     * @param {number} [count=10] - Log count to retrieve
     * @returns {Promise<JSON>} - Unformatted JSON data from API
     */
    async getLogs(type = 'sogo', count = 10) {
        return this.request({
            url: `${this._baseurl}/api/v1/get/logs/${type}/${count}`,
            headers: this._headers,
            method: 'get'
        });
    }

    /**
     * @private
     * @param {String} url
     * @returns {Promise<Boolean>} - True if domain is available
     */
    async checkAvailable(url) {
        if (!url) throw new Error('No domain name provided');
        const domainWhois = await require('whoiser').domain(url);
        return domainWhois['whois.pir.org'].text[0] === 'URL of the ICANN Whois Inaccuracy Complaint Form https://www.icann.org/wicf/';
    }

    /**
     * @private
     * @param {Object} def
     * @param {Object} given
     * @returns {Object} - Merged default and given options
     */
    async mergeDefault(def, given) {
        if (!given) return def;
        const defaultKeys = Object.keys(def);
        for (const key of defaultKeys) {
            if (def[key] === null) {
                if (!given[key]) throw new Error(`${key} was not found from the given options.`);
            }
            if (given[key] === null || given[key] === undefined) given[key] = def[key];
        }
        for (const key in defaultKeys) {
            if (defaultKeys.includes(key)) continue;
            delete given[key];
        }
        return given;
    }
}

module.exports = Mailcow;
