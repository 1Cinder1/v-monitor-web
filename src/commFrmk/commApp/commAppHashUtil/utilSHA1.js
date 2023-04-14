
/************************************************************************************************************
 * 实现功能：实现SHA1散列加密算法
 * 创    建：张洪波   2020年05月20日
 * 最近更新: 张洪波   2020年05月20日
 * 相关说明：
 * 附注说明：
 *************************************************************************************************************/

/* 十六进制输出格式。0 -小写；1 -大写 */
var hexcase = 0;

/* base- 64填充字符。“=”表示严格的RFC合规性 */
var b64pad = "";

/* 每个输入字符的位数。8 - ASCII；16 -统一码 */
var chrsz = 8;

function hex_hmac_sha1(key, data)
{
    return binb2hex(core_hmac_sha1(key, data));
}

function b64_hmac_sha1(key, data)
{
    return binb2b64(core_hmac_sha1(key, data));
}

function str_hmac_sha1(key, data)
{
    return binb2str(core_hmac_sha1(key, data));
}

function sha1_vm_test()
{
    return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

function core_sha1(x, len)
{
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;

    var w = Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;

    for (var i = 0; i < x.length; i += 16)
    {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;

        for (var j = 0; j < 80; j++)
        {
            if (j < 16) w[j] = x[i + j];
            else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
        }

        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);

}

function sha1_ft(t, b, c, d)
{
    if (t < 20) return (b & c) | ((~b) & d);
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}

function sha1_kt(t)
{
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
}

function core_hmac_sha1(key, data)
{
    var bkey = str2binb(key);
    if (bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

    var ipad = Array(16),
        opad = Array(16);
    for (var i = 0; i < 16; i++)
    {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
    return core_sha1(opad.concat(hash), 512 + 160);
}

function safe_add(x, y)
{
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

function rol(num, cnt)
{
    return (num << cnt) | (num >>> (32 - cnt));
}

function str2binb(str)
{
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < str.length * chrsz; i += chrsz)
        bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
    return bin;
}

function bytes2binb(byteArray)
{
    var bin = Array();
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < byteArray.length * chrsz; i += chrsz)
        bin[i >> 5] |= (byteArray[i / chrsz] & mask) << (24 - i % 32);
    return bin;
}

function binb2str(bin)
{
    var str = "";
    var mask = (1 << chrsz) - 1;
    for (var i = 0; i < bin.length * 32; i += chrsz)
        str += String.fromCharCode((bin[i >> 5] >>> (24 - i % 32)) & mask);
    return str;
}

function binb2hex(binarray)
{
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i++)
    {
        str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 -
            i % 4) * 8)) & 0xF);
    }
    return str;
}

function binb2b64(binarray)
{
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var str = "";
    for (var i = 0; i < binarray.length * 4; i += 3)
    {
        var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) %
            4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
        for (var j = 0; j < 4; j++)
        {
            if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
            else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
        }
    }
    return str;
}

/* 获取字符串的UTF-8编码的字节数组 */
function stringToUtf8Byte(str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for(var i = 0; i < len; i++) {
        c = str.charCodeAt(i);1000
        if (!(c & 0xFFFF80)) {
            bytes.push(c & 0xFF);
        } else if (!(c & 0xFFF800)) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else if (!(c >= 0xFF0000)) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        }
    }
    return bytes;
}


var hex_sha1 = function (s)
{
    var byteArray = stringToUtf8Byte(s);
    return binb2hex(core_sha1(bytes2binb(byteArray), byteArray.length * chrsz));
};

var b64_sha1 = function b64_sha1(s)
{
    return binb2b64(core_sha1(str2binb(s), s.length * chrsz));
};

var  str_sha1 = function str_sha1(s)
{
    return binb2str(core_sha1(str2binb(s), s.length * chrsz));
};

/**
 * 实现功能:模块导出的对象
 */
var utilSHA1 =
    {
        FuncHexSa1:hex_sha1,
        FuncBase64Sha1:b64_sha1,
        FuncStrSha1:str_sha1
    };

export default utilSHA1;
