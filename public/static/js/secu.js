function validateToken() {
    return new Promise((resolve, reject)=>{
        if (localStorage.getItem('x-sr-vtime')!==undefined &&
            (new Date()).getTime()-localStorage.getItem('x-sr-vtime')<(5*60000)){
                resolve('CSR_TIME_VALID');
        } else {
            const valReq = new XMLHttpRequest();
            valReq.open('POST', 'https://xtacy.org/_secu/csrtoken/', true);
            valReq.setRequestHeader('Content-Type', 'application/json');

            var key = localStorage.getItem( config.csrfTokenNameKey );
            var token = localStorage.getItem( config.csrfTokenName+key );
            if(key===null) {
                const genTReq = new XMLHttpRequest();
                genTReq.open('GET', 'https://xtacy.org/_secu/csrtoken/', true);
                genTReq.send();
                genTReq.onreadystatechange = () => {
                    if(genTReq.readyState===4 && genTReq.status===200) {
                        key = JSON.parse(genTReq.response).key, token = JSON.parse(genTReq.response).token;
                        localStorage.setItem(config.csrfTokenNameKey, key);
                        localStorage.setItem(config.csrfTokenName+key, token);
                        resolve('CSR_TOKEN_GEN');
                    }
                }
            } else {
                valReq.send(JSON.stringify({ "key" : key, "token" : token }));
            }
            
            valReq.onreadystatechange = () => {
                if(valReq.readyState===4 && valReq.status===200) {
                    let valRes = JSON.parse(valReq.response);
                    if(valRes.status===true) {
                        localStorage.setItem('x-sr-vtime', (new Date()).getTime())
                        resolve('CSR_TOKEN_VALID');
                    } else if(valRes.status===false) {
                        localStorage.removeItem(config.csrfTokenName+key);
                        key = valRes.key, token = valRes.token;
                        localStorage.setItem(config.csrfTokenNameKey, key);
                        localStorage.setItem(config.csrfTokenName+key, token);
                        resolve('CSR_TOKEN_RENEW');
                    } else {
                        let k = localStorage.getItem( config.csrfTokenNameKey );
                        localStorage.removeItem( config.csrfTokenNameKey );
                        localStorage.removeItem( config.csrfTokenName+k );
                        delete k;
                        reject('CSR_TOKEN_INVALID');
                    }
                }
            }
        }
    })
}

function generateSecurityFluff(amount) {
    let arr = ['_td-xhr', '__id', 'k_0-g01G', '_fl_namk-xtc'];
    for(let i=0;i<amount;i++) {
        let tag = arr[i%4];
        let fluff = "";
        let fluff_len = Math.floor(Math.random()*24);
        if(i%2===0) {
            for(let n=0;n<fluff_len;n++)
                fluff += Math.floor(Math.random()*36).toString('36')
        } else {
            for(let n=0;n<fluff_len;n++)
                fluff += Math.floor(Math.random()*10)
        }
        localStorage.setItem(tag, fluff);
    }    
}