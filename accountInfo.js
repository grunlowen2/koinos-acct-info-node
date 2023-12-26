const axios = require('axios');
const fs = require('node:fs');
const os = require('os')
const log = require('npmlog')

const ACCT = "<<some_koinos_account>>" //Target Koinos account.
const API_KEY = "<<coingecko_key>>" //Not required. Only if you want price. From your CoinGecko account. You can get a free API key.
const LOG_OUTPUT = true //If want to see output in console
const APPEND_CSV = true  //If want to write to a CSV file

const KOIN_API = "https://rest.koinos.tools/api"
const COINGECKO_API = "https://api.coingecko.com/api/v3"
const KOIN = "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL"
const VHP = "18tWNU7E4yuQzz7hMVpceb9ixmaWLVyQsr"
const ACCOUNT_URL = `account/${ACCT}`
const BALANCE = `${ACCOUNT_URL}/balance`
const MANA_BALANCE = `${ACCOUNT_URL}/mana`
const KOIN_BALANCE = `${BALANCE}/${KOIN}`
const VHP_BALANCE = `${BALANCE}/${VHP}`
const HISTORY_CSV = `${__dirname}/acct_history.csv`

function getBalances() {
    let koin = getKoinData(KOIN_BALANCE)
    let vhp = getKoinData(VHP_BALANCE)
    let mana = getKoinData(MANA_BALANCE)
    let price = getCoinGeckoPrice()
    const now = new Date()
    const today = `${now.getMonth()}/${now.getDate()}/${now.getFullYear()}`
    Promise.all([koin, vhp, mana, price]).then(resp => {
        koin = parseFloat(resp[0])
        vhp = parseFloat(resp[1])
        mana = parseFloat(resp[2])
        price = parseFloat(resp[3])
        const totalKoinVhp = koin + vhp
        if (LOG_OUTPUT) {
            log.info(`today = ${today}`)
            log.info(`totalKoinVhp = ${totalKoinVhp}`)
            log.info(`koin = ${koin}`)
            log.info(`vhp = ${vhp}`)
            log.info(`mana = ${mana}`)
            log.info(`price = ${price}`)
        }
        if (APPEND_CSV) {
            if(!fs.existsSync(HISTORY_CSV)) {
                fs.appendFileSync(HISTORY_CSV, "date,totalKoinVhp,koin,vhp,mana,price")
            }
            const csvEntry = `\n${today},${totalKoinVhp},${koin},${vhp},${mana},${price}`
            fs.appendFileSync(HISTORY_CSV, csvEntry, { flag: 'a+' }, err2 => { log(err2)})
        }
    })
}

async function getKoinData(action) {
    try {
        const resp = await axios.get(`${KOIN_API}/${action}`)
        return resp.data.value
    } catch (error) {
        log.error(error)
    }
}

async function getCoinGeckoPrice() {
    if (API_KEY.length < 5) {
        return "n/a"
    }
    try {
        const resp = await axios.get(`${COINGECKO_API}/simple/price?ids=koinos&` +
            `vs_currencies=usd&x_cg_api_key=${API_KEY}`)
        return resp.data['koinos']['usd']
    } catch (error) {
        log.error(error)
    }
}

getBalances()
