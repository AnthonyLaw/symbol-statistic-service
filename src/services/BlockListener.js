const http = require('./Http');
const config = require('../config.json');
const sdk = require('nem2-sdk');
const format = require('../format')
const statistic = require('./Statistic');
const periodDuration = config.periodDuration;

var lastRecoredBlockTimestamp = 1;

class BlockListener {
    constructor() {
        this.listener = http.listener;
    
        this.listener.open()
        .then(() => 
            this.listener
                .newBlock()
                .subscribe(
                    block => this.onBlockNewReceived(block), 
                    err => console.error(err)
                )
        );
    }

    onBlockNewReceived(block) {
        const currentBlockTimestamp = format.formatTimestamp(block.timestamp.compact());
        if(currentBlockTimestamp - statistic.lastPeriodTimestamp > periodDuration){
            console.log('Listener received block #', block.height.compact(), 'from the new period',)
            statistic.fetchNewSetOfBlocks(block.height.compact())
                .then(() => {})
                .catch(err => {
                    console.log(err);
                });
        }
        else console.log('Period', currentBlockTimestamp - statistic.lastPeriodTimestamp, 'expected', periodDuration)
    }

    close() {
        if(this.listener)
            this.listener.close();
    }
}

module.exports = new BlockListener();