

const Member = require("./models/member")
const Purchases = require("./models/purchases")
const Earning = require("./models/earning")
const EarningTrans = require("./models/earning_transaction")
const Ticket = require("./models/ticket")
const MUnilevel = require('./models/monthly_unilevel')
const MUDetails = require('./models/monthly_unilevel_detail')
const ProductCode = require('./models/productCode')
const Products = require('./models/product')
const BusinessCenter = require('./models/businessCenter')
const Processtracker = require('./models/processtracker')
const Ticketcounter = require('./models/ticketcounter')
const Code = require('./models/code')
const Binary = require('./models/binary')

const _ = require("lodash")
const moment = require('moment')
var async = require('async')
var ObjectId = require('mongoose').Types.ObjectId;

function Controller() {

    this.processUnilevel = function (body, res) {
       
        function processNow(body, icb) {

            checkImmediateSponsor(body.member._id, body.member.account_type,  (retParam) => {        

                async.each(body.codes, function (e, next) {                                  
                    var m_subtotal =  body.member.account_type == 2 ? e.dealer_price?e.dealer_price:0 : e.reseller_price?e.reseller_price:0
                    var data = {
                        member_id: retParam.id,
                        account_type: retParam.account_type,
                        transdate: moment().toDate(),
                        transtime: moment().toDate(),
                        order_id: null,
                        product_id: e.product_id,
                        productname: e.productname,
                        price: e.price,
                        discountedprice: e.discountedprice,
                        qty: 1, 
                        discount: Number(e.price) - m_subtotal,
                        subtotal: m_subtotal,
                        productcode: e.codenum,
                        cv: e.cv?e.cv:0,
                        transtype: 0,
                        dealers_price: e.dealer_price?e.dealer_price:0,
                        resellers_price: e.reseller_price?e.reseller_price:0,
                    }
                    // console.log(data)
                    // next()  
                    var newPurchases = Purchases(data);
                    newPurchases.save()
                    .then((purch)=>{
                        // console.log(purch)
                        checkRoyaltyBonus(retParam, body.member._id, body.member.account_type, e, () => {                                                      
                            // add rebates levell(me) here
                            var rebates = parseFloat(e.cv?e.cv:0) * (parseFloat(e.me?e.me:0) / 100)                                    
                            checkHasHeader(retParam.id, purch.transdate, () => {                              
                                saveUnilevelPoints(retParam.id, rebates, 0, purch, body.member.account_type, () => {                               
                                    // level 1-9
                                    checkHasHeader(body.member._id, purch.transdate, () => {
                                        updateMonthlyUnilevelBalance(body.member._id, purch.transdate, () => {
                                            iterateUnilevel(body.member, purch, e, () => {                                                                                                               
                                                next()                                                                            
                                            })
                                        })
                                        
                                    })                                                                                                                                                                                                                                                
                                })
                            })                        
                        })       
                    })
                }, function (err) {
                    checkUpdateProcessStatus(body.sender_id, () => {    
                        console.log("Process done")   
                        icb()           
                    })                    
                })                                            
            })
        }

        function checkImmediateSponsor(id, acctype,  icb) {
            var immSponsor = {
                id: id,
                account_type: acctype
            }

            if (acctype>1){
                icb(immSponsor)
            }else{

                function getMember(id, cb) {
                    let member = null
                    Member.findById(id, "sponsorid fullname")
                        .populate({ path: "sponsorid", select: "fullname account_type status" })
                        .then((result) => {
                            if (result) {
                                member = result.sponsorid
                            }
                            cb(member)
                        })
                }
            
                const findImmediateDealerSponsor = function () {
                    return new Promise(function (resolve, reject) {
                        // console.log(sponsor.fullname)
                        getMember(id, (sponsor) => {
                            if (sponsor) {
                                // console.log(sponsor)
                                let counter = {                            
                                    sponsor_id: sponsor._id,
                                    account_type: sponsor.account_type,
                                    name: sponsor.fullname
                                }
                                console.log(sponsor.fullname + " --> " + sponsor.account_type)
                                async.whilst(
                                    function check(proceed) {
                                        proceed(null, ((counter.sponsor_id != null)))
                                    },
                                    function iter(next) {
                                        console.log(counter.name)                            
                                        getMember(counter.sponsor_id, (nextMember) => {
                                            if (nextMember) {
                                                if (counter.account_type < 2) {                                            
                                                    counter.sponsor_id = nextMember._id
                                                    counter.account_type = nextMember.account_type
                                                    counter.name = nextMember.fullname
                                                    next()
                                                } else {
                                                    immSponsor.id = counter.sponsor_id
                                                    immSponsor.account_type = counter.account_type
                                                    counter.sponsor_id = null
                                                    next()
                                                }
                                            } else {
                                                immSponsor.id = counter.sponsor_id
                                                immSponsor.account_type = counter.account_type
                                                next()
                                            }
                                        })
                                    },
                                    function (err) {                                
                                        resolve()
                                    }
                                )
                            } else {
                                resolve()
                            }
                        })
                    })
                }

                findImmediateDealerSponsor()
                .then(function () {
                    icb(immSponsor)
                })
                .catch(function (err) {
                    console.log(err);
                    icb(immSponsor)
                })
            }
        }
        
        function checkRoyaltyBonus(sponsor, member_id, member_acctype, item, cb) {

            var earning_id = ""
            
            // if level 1,  sponsor is dealer and order member type is reseller
            if (sponsor.account_type == 2 && member_acctype == 1) {
                console.log("checkRoyaltyBonus....1")
                var rbamount = item.reseller_price - item.dealer_price

                const getEarningHeader = function () {
                    return new Promise(function (resolve, reject) {
                        Earning.findOne({ member_id: sponsor.id }).lean()
                        .then((result) => {                        
                            if (result) {
                                earning_id = result._id
                                resolve()
                            } else {
                                reject({ name: "Earning header not found" })
                            }
                        })
                    })
                }

                const saveEarnings = function () {
                    return new Promise(function (resolve, reject) {
                        if (rbamount > 0) {
                            var data = {
                                earning_id: earning_id,
                                transdate: moment().format("YYYY-MM-DD HH:mm:ss"),
                                earning_type: 7,
                                amount: rbamount,
                                binary_id: null,
                                account_id: null,
                                trans_type: 0,
                                remarks: "",
                                member_id: member_id
                            }
                            var newTrans = EarningTrans(data);
                            newTrans.save()
                            .then(() => {                            
                                updateEarningBalance(earning_id, () => {
                                })
                                resolve();
                            })
                        } else {
                            resolve();
                        }
                    })
                }

                getEarningHeader()
                    .then(saveEarnings)
                    .then(function () {
                        cb()
                    })
                    .catch(function (err) {
                        console.log(err);
                        cb()
                    })
            } else {
                cb()
            }
        }

        function updateEarningBalance(id, callback) {

            var earnings = {
                direct: 0,
                direct_balance: 0,
                direct_transferred: 0,

                indirect: 0,
                indirect_balance: 0,
                indirect_transferred: 0,

                pair: 0,
                pairing_balance: 0,
                pairing_transferred: 0,

                upgrade_funds: 0,
                upgrade_funds_balance: 0,
                upgrade_funds_used: 0,

                renewal_funds: 0,
                renewal_funds_balance: 0,
                renewal_funds_used: 0,

                cd_funds: 0,
                cd_funds_balance: 0,
                cd_funds_paid: 0,

                fifth_pair: 0,

                royalty: 0,
                royalty_balance: 0,
                royalty_transferred: 0,

                unilevel: 0,
                unilevel_balance: 0,
                unilevel_transferred: 0,

                accumulated: 0,
                balance: 0
            }

            const getDirectReferral = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 0, (amount) => {
                        earnings.direct = amount
                        resolve()
                    })
                })
            }

            const getUpgradeFunds = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 1, (amount) => {
                        earnings.upgrade_funds = amount
                        resolve()
                    })
                })
            }

            const getIndirectReferral = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 2, (amount) => {
                        earnings.indirect = amount
                        resolve()
                    })
                })
            }

            const getPairing = function () {
                return new Promise(function (resolve, reject) {
                    EarningTrans.aggregate([
                        {
                            $match: { earning_id: new ObjectId(id), earning_type: 3, trans_type: 0 }
                        },
                        {
                            $group: {
                                _id: { pid: "$earning_id", ptype: "$earning_type", ttype: "$trans_type" },
                                total: { $sum: "$amount" }
                            }
                        }
                    ])
                        .then((result) => {
                            if (!_.isEmpty(result)) {
                                earnings.pair = result[0].total
                                if (earnings.pair < 0) {
                                    earnings.pair = 0
                                }
                            }
                            resolve()
                        })
                })
            }

            const getFifthPair = function () {
                return new Promise(function (resolve, reject) {
                    EarningTrans.aggregate([
                        {
                            $match: { earning_id: new ObjectId(id), earning_type: 4, trans_type: 0 }
                        },
                        {
                            $group: {
                                _id: { pid: "$earning_id", ptype: "$earning_type", ttype: "$trans_type" },
                                total: { $sum: "$amount" }
                            }
                        }
                    ])
                        .then((result) => {
                            if (!_.isEmpty(result)) {
                                earnings.fifth_pair = result[0].total
                                if (earnings.fifth_pair < 0) {
                                    earnings.fifth_pair = 0
                                }
                            }
                            resolve()
                        })
                })
            }

            const getRenewalFunds = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 5, (amount) => {
                        earnings.renewal_funds = amount
                        resolve()
                    })
                })
            }

            const getCDFunds = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 6, (amount) => {
                        earnings.cd_funds = amount
                        resolve()
                    })
                })
            }

            const getRoyaltyBonus = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 7, (amount) => {
                        earnings.royalty = amount
                        resolve()
                    })
                })
            }

            const getUnilevelCom = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 8, (amount) => {
                        earnings.unilevel = amount
                        resolve()
                    })
                })
            }

            const getDirectTransferred = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 10, (amount) => {
                        earnings.direct_transferred = amount
                        resolve()
                    })
                })
            }

            const getIndirectTransferred = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 11, (amount) => {
                        earnings.indirect_transferred = amount
                        resolve()
                    })
                })
            }

            const getPairingTransferred = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 12, (amount) => {
                        earnings.pairing_transferred = amount
                        resolve()
                    })
                })
            }

            const getUpgradeFundsUsed = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 13, (amount) => {
                        earnings.upgrade_funds_used = amount
                        resolve()
                    })
                })
            }

            const getRenewalFundsUsed = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 14, (amount) => {
                        earnings.renewal_funds_used = amount
                        resolve()
                    })
                })
            }

            const getCDFundsPaid = function () {
                return new Promise(function (resolve, reject) {
                    EarningTrans.aggregate([
                        {
                            $match: { earning_id: new ObjectId(id), earning_type: 15, trans_type: { $in: [0, 2] } }
                        },
                        {
                            $group: {
                                _id: { pid: "$earning_id", ptype: "$earning_type" },
                                total: { $sum: "$amount" }
                            }
                        }
                    ])
                        .then((result) => {
                            if (!_.isEmpty(result)) {
                                earnings.cd_funds_paid = result[0].total
                                if (earnings.cd_funds_paid < 0) {
                                    earnings.cd_funds_paid = 0
                                }
                            }
                            resolve()
                        })
                })
            }

            const getRoyaltyTransferred = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 16, (amount) => {
                        earnings.royalty_transferred = amount
                        resolve()
                    })
                })
            }

            const getUnilevelTransferred = function () {
                return new Promise(function (resolve, reject) {
                    queryEarningTrans(id, 17, (amount) => {
                        earnings.unilevel_transferred = amount
                        resolve()
                    })
                })
            }

            const updateEarnings = function () {
                return new Promise(function (resolve, reject) {

                    earnings.accumulated = earnings.direct + earnings.indirect + earnings.pair + earnings.royalty

                    earnings.direct_balance = earnings.direct - earnings.direct_transferred
                    earnings.indirect_balance = earnings.indirect - earnings.indirect_transferred
                    earnings.pairing_balance = earnings.pair - earnings.pairing_transferred
                    earnings.royalty_balance = earnings.royalty - earnings.royalty_transferred
                    earnings.unilevel_balance = earnings.unilevel - earnings.unilevel_transferred

                    earnings.upgrade_funds_balance = earnings.upgrade_funds - earnings.upgrade_funds_used
                    earnings.renewal_funds_balance = earnings.renewal_funds - earnings.renewal_funds_used
                    earnings.cd_funds_balance = earnings.cd_funds - earnings.cd_funds_paid

                    earnings.cd_funds_balance = earnings.cd_funds_balance < 0 ? 0 : earnings.cd_funds_balance

                    earnings.direct_balance = earnings.direct_balance < 0 ? 0 : earnings.direct_balance
                    earnings.indirect_balance = earnings.indirect_balance < 0 ? 0 : earnings.indirect_balance
                    earnings.pairing_balance = earnings.pairing_balance < 0 ? 0 : earnings.pairing_balance
                    earnings.royalty_balance = earnings.royalty_balance < 0 ? 0 : earnings.royalty_balance
                    earnings.unilevel_balance = earnings.unilevel_balance < 0 ? 0 : earnings.unilevel_balance

                    let total_transferred = earnings.direct_transferred + earnings.indirect_transferred + earnings.pairing_transferred + earnings.royalty_transferred + earnings.unilevel_transferred
                    earnings.balance = earnings.accumulated - total_transferred

                    Earning.findByIdAndUpdate(id, earnings)
                    .then(() => {
                        resolve()
                    })
                })
            }

            getDirectReferral()
                .then(getUpgradeFunds)
                .then(getIndirectReferral)
                .then(getPairing)
                .then(getFifthPair)
                .then(getRoyaltyBonus)
                .then(getRenewalFunds)
                .then(getCDFunds)
                .then(getUnilevelCom)
                .then(getDirectTransferred)
                .then(getIndirectTransferred)
                .then(getPairingTransferred)
                .then(getUpgradeFundsUsed)
                .then(getRenewalFundsUsed)
                .then(getCDFundsPaid)
                .then(getRoyaltyTransferred)
                .then(getUnilevelTransferred)
                .then(updateEarnings)
                .then(() => {
                    callback()
                })
                .catch((error) => {
                    console.log(error)
                    callback()
                })
        }
        
        function queryEarningTrans(id, ctype, cb) {

            var total = 0;
            EarningTrans.aggregate([
                {
                    $match: { earning_id: new ObjectId(id), earning_type: ctype }
                },
                {
                    $group: {
                        _id: { pid: "$earning_id", ptype: "$earning_type" },
                        total: { $sum: "$amount" }
                    }
                }
            ])
            .then((result) => {                
                if (!_.isEmpty(result)) {
                    if (result.length > 0) {
                        total = result[0].total
                        if (total < 0) { total = 0 }
                    }
                }
                cb(total)
            })
        }

        function checkHasHeader(id, transdate, cb) {

            var nYear = moment(transdate).year()
            var nMonth = moment(transdate).month()
            MUnilevel.findOne({ member_id: new ObjectId(id), nmonth: nMonth, nyear: nYear })
            .then((result) => {
                if (result) {
                    cb()
                } else {
                    console.log("-create header 2-")
                    var data = {
                        member_id: id,
                        nmonth: nMonth,
                        nyear: nYear,
                        personalsales: 0,
                        groupsales: 0,
                        personalcv: 0,
                        groupcv: 0,
                        unilevel: 0,
                    }
                    var newMonthlyUnilevel = MUnilevel(data);
                    newMonthlyUnilevel.save()
                    .then((result1) => {
                        if (err) {
                            console.log(err)
                            cb(err)
                        } else {
                            cb()
                        }
                    })
                }
            })
        }

        
        function saveUnilevelPoints(sponsor, points, level, purch, acounttype, cb) {

            var header_id = ""

            if (points <= 0) {
                cb()
            } else if (acounttype < 2) {
                cb()
            } else {
                const checkUnilevelHeader = function () {
                    return new Promise(function (resolve, reject) {
                        var nYear = moment().year()
                        var nMonth = moment().month()               
                        MUnilevel.findOne({ member_id: new ObjectId(sponsor), nmonth: nMonth, nyear: nYear })
                        .then((result) => {                                                     
                            if (result) {
                                console.log("--found header---")
                                header_id = result._id
                                resolve()
                            } else {
                                console.log("-create header-")
                                var data = {
                                    member_id: sponsor,
                                    nmonth: nMonth,
                                    nyear: nYear,
                                    accumulated: 0,
                                    transferred: 0,
                                    balance: 0,
                                    personalcv: 0,
                                    groupcv: 0,
                                    withdrawal: 0,
                                }                                
                                var newMonthlyUnilevel = MUnilevel(data);
                                newMonthlyUnilevel.save()
                                .then((result1) => {
                                    header_id = result1._id
                                    resolve()
                                })
                            }                            
                        });
                    })
                }

                const savePoints = function () {
                    return new Promise(function (resolve, reject) {
                        console.log("savePoints", header_id, points)
                        var data = {
                            monthly_unilevel_id: header_id,
                            order_id: null,
                            puchase_id: purch._id,
                            points: points,
                            level: level,
                            transtype: 1
                        }              
                        var newMUDetails = MUDetails(data);
                        newMUDetails.save()
                        .then((result1) => {                        
                            updateMonthlyUnilevelBalance(sponsor, purch.transdate, () => {
                            })
                            resolve()
                        })
                    })
                }

                checkUnilevelHeader()
                    .then(savePoints)
                    .then(function () {
                        cb()
                    })
                    .catch(function (err) {
                        console.log(err);
                        cb()
                    })
            }
        }

        
        function updateMonthlyUnilevelBalance(id, transdate, cb) {

            console.log("updateMonthlyUnilevelBalance....." + id)
            var header = null

            var balance = {
                personalsales: 0,
                groupsales: 0,
                personalcv: 0,
                groupcv: 0,
                unilevel: 0
            }

            const getUnilevelHeader = function () {
                return new Promise(function (resolve, reject) {
                    var nYear = moment(transdate).year()
                    var nMonth = moment(transdate).month()
                    MUnilevel.findOne({ member_id: new ObjectId(id), nmonth: nMonth, nyear: nYear })
                    .then((result) => {
                        if (result) {
                            header = result
                            resolve()
                        } else {
                            var _err = { name: "No header" };
                            reject(_err);
                        }
                    })
                })
            }

            const getPersonal = function () {
                return new Promise(function (resolve, reject) {
                    var dfrom = new Date(moment().month(header.nmonth).year(header.nyear).startOf('month'))
                    var dto = new Date(moment().month(header.nmonth).year(header.nyear).endOf('month'))
                    var total = 0
                    Purchases.aggregate([
                        {
                            $match: { member_id: new ObjectId(header.member_id), transdate: { $gte: dfrom, $lte: dto } }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$subtotal" }
                            }
                        }
                    ])
                    .then((result) => {                        
                        if (!_.isEmpty(result)) {
                            if (result.length > 0) {
                                total = result[0].total
                                if (total < 0) { total = 0 }
                            }
                        }
                        balance.personalsales = total
                        resolve()
                    })
                })
            }

            const getPersonalCv = function () {
                return new Promise(function (resolve, reject) {
                    var dfrom = new Date(moment().month(header.nmonth).year(header.nyear).startOf('month'))
                    var dto = new Date(moment().month(header.nmonth).year(header.nyear).endOf('month'))
                    var total = 0
                    Purchases.aggregate([
                        {
                            $match: { member_id: new ObjectId(header.member_id), transdate: { $gte: dfrom, $lte: dto } }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$cv" }
                            }
                        }
                    ])
                    .then((result) => {
                        if (!_.isEmpty(result)) {
                            if (result.length > 0) {
                                total = result[0].total
                                if (total < 0) { total = 0 }
                            }
                        }
                        balance.personalcv = total
                        resolve()
                    })
                })
            }

            const getGroupSalesCvAndUnilevel = function () {
                return new Promise(function (resolve, reject) {
                    MUDetails.find({ monthly_unilevel_id: new ObjectId(header._id) })
                    .populate({ path: 'puchase_id' })
                    .then((result) => {
                        if (!_.isEmpty(result)) {
                            balance.groupsales = _.sumBy(result, function (o) { return !_.isEmpty(o.puchase_id) ? o.puchase_id.subtotal : 0 });
                            balance.groupcv = _.sumBy(result, function (o) { return !_.isEmpty(o.puchase_id) ? o.puchase_id.cv : 0 });
                            balance.unilevel = _.sumBy(result, function (o) { return o.points });
                        }
                        resolve()
                    })
                })
            }

            const updateEarnings = function () {
                return new Promise(function (resolve, reject) {
                    MUnilevel.findByIdAndUpdate(header._id, balance)
                    .then(() => {
                        resolve()
                    })
                })
            }

            getUnilevelHeader()
                .then(getPersonal)
                .then(getPersonalCv)
                .then(getGroupSalesCvAndUnilevel)
                .then(updateEarnings)
                .then(function () {
                    // console.log(balance)
                    cb()
                })
                .catch(function (err) {
                    console.log(err);
                    cb()
                })

        }

        
        function iterateUnilevel(member, purch, item, icb) {

            function getMember(id, cb) {
                let member = null
                Member.findById(id, "sponsorid fullname")
                    .populate({ path: "sponsorid", select: "fullname account_type status" })
                    .then((result) => {
                        if (result) {
                            member = result.sponsorid
                        }
                        cb(member)
                    })
            }

            const mapUnilevel = function () {
                return new Promise(function (resolve, reject) {
                    getMember(member._id, (sponsor) => {
                        if (sponsor) {
                            let counter = {
                                level: 1,
                                sponsor_id: sponsor._id,
                                account_type: sponsor.account_type,
                                name: sponsor.fullname
                            }
                            async.whilst(
                                function check(proceed) {
                                    proceed(null, ((counter.sponsor_id != null) && (counter.level <= 9)))
                                },
                                function iter(next) {
                                    console.log(counter.name + " --> "+ counter.level)
                                    var points = 0
                                    var cv = purch.cv
                                    if (counter.account_type == 2) {
                                        if (counter.level == 1) {
                                            points = parseFloat(cv) * (parseFloat(item.level1?item.level1:0) / 100)
                                        } else if (counter.level == 2) {
                                            points = parseFloat(cv) * (parseFloat(item.level2?item.level2:0) / 100)
                                        } else if (counter.level == 3) {
                                            points = parseFloat(cv) * (parseFloat(item.level3?item.level3:0) / 100)
                                        } else if (counter.level == 4) {
                                            points = parseFloat(cv) * (parseFloat(item.level4?item.level4:0) / 100)
                                        } else if (counter.level == 5) {
                                            points = parseFloat(cv) * (parseFloat(item.level5?item.level5:0) / 100)
                                        } else if (counter.level == 6) {
                                            points = parseFloat(cv) * (parseFloat(item.level6?item.level6:0) / 100)
                                        } else if (counter.level == 7) {
                                            points = parseFloat(cv) * (parseFloat(item.level7?item.level7:0) / 100)
                                        } else if (counter.level == 8) {
                                            points = parseFloat(cv) * (parseFloat(item.level8?item.level8:0) / 100)
                                        } else if (counter.level == 9) {
                                            points = parseFloat(cv) * (parseFloat(item.level9?item.level9:0) / 100)
                                        }
                                    }
                                    // console.log("level: " + counter.level)
                                    saveUnilevelPoints(counter.sponsor_id, points, counter.level, purch, counter.account_type, () => {
                                        getMember(counter.sponsor_id, (nextMember) => {
                                            if (nextMember) {
                                                if (counter.account_type == 2) {
                                                    counter.level += 1
                                                    counter.sponsor_id = nextMember._id
                                                    counter.account_type = nextMember.account_type
                                                    counter.name = nextMember.fullname
                                                    next()
                                                } else if (counter.account_type == 1) {
                                                    counter.sponsor_id = nextMember._id
                                                    counter.account_type = nextMember.account_type
                                                    counter.name = nextMember.fullname
                                                    next()
                                                }
                                            } else {
                                                counter.sponsor_id = null
                                                next()
                                            }
                                        })
                                    })
                                },
                                function (err) {
                                    resolve()
                                }
                            )
                        } else {
                            resolve()
                        }
                    })
                })
            }
            mapUnilevel()
            .then(function () {
                icb()
            })
            .catch(function (err) {
                console.log(err);
                icb()
            })
        }


        function checkUpdateProcessStatus(id, cb) {
         
            const updateCheck = function () {
                return new Promise(function (resolve, reject) {
                    Processtracker.findOne({member_id: id, status: 0})
                    .then((result) => {
                        if (result) {
                            Processtracker.findByIdAndUpdate(result._id, {status: 1})
                            .then((result) => {
                                resolve()
                            })
                        } else {
                            console.log("No process found")
                            resolve()
                        }
                        
                    })
                })
            }
            
            updateCheck()       
            .then(function () {
                cb()
            })
            .catch(function (err) {
            console.log(err)
                cb()
            })

        }

        processNow(body, () => {            
        })
        res.json({ status: 1, message: 'Success' });

    }
}

module.exports = new Controller()