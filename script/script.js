const input = document.querySelector('input');
const res = document.querySelector('div');

async function getData(url) {
    let res = await fetch(url);
    if (!res.ok) {
        throw new Error(`${res.url}: ${res.status}`);
    }

    return await res.json();
}

async function calculateFees() {
    const additional_auction_fee = await getData('./../db/additional_auction_fee.json');
    const auction_fee = await getData('./../db/auction_fee.json');
    const services = await getData('./../db/services.json');
    const additional_payments = await getData('./../db/additional_payments.json');

    input.addEventListener('input', () => {
        if(isNaN(input.value) || input.value == '') {
            res.textContent = 0;
        } else {
            let sum = 0;
            const additionalAuctionFee = comparePrices(additional_auction_fee.additional_fee, input);
            const auctionFee = compareFees(auction_fee.Auction_fee, input);
            const servicesSum = calculateServices(services.SERVICES);
            const additionalPayments = calculatePayments(additional_payments);

            sum = +additionalAuctionFee + +auctionFee + servicesSum + additionalPayments;
            const fullPrice = (sum + (sum * additional_payments.insurance_percent / 100)).toFixed(2);
            res.textContent = fullPrice;
        }
    });
}

calculateFees();

function find(data, input) {
    const inputValue = +(input.value);

    const result = data.find(obj => {
        const value = obj.range.split('-');
        const minValue = value[0].replace('$', '').replace(',', '').replace('+', '').trim();
        let maxValue;
        
        if (value[1]) {
            maxValue = value[1].replace('$', '').replace(',', '').replace('+', '').trim();
        }

        if (inputValue >= minValue && inputValue <= maxValue || inputValue >= minValue && (typeof(maxValue) === 'undefined')) {
            return true;
        }
    });

    return result;
}

function comparePrices(data, input) {
    let result = find(data, input);

    if (result) {
        const price = +(result.price).replace('$', '');
        return price;
    }
}

function compareFees(data, input) {
    let result = find(data, input);

    if (result) {
        let fee;
        if (result.fee.includes('%')) {
            fee = input.value * (+((result.fee.replace('%', '')) / 100));
        } else {
            fee = +(result.fee).replace('$', '');
        }
        return fee;
    }
}

function calculateServices(data) {
    let res = 0;
    for (value in data) {
        res += data[value];
    }
    return res;
}

function calculatePayments(data) {
    let res = 0;
    res += data['ADDITIONAL_PAYMENTS'];
    res += data['Another Payment'];
    return res;
}