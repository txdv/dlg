
var smf_iso_case_folding = false,
    smf_charset = "UTF-8";

var sha1 = require('./sha1.js').sha1;


// A property we'll be needing for php_to8bit.
String.prototype.oCharsetConversion = {
	from: '',
	to: ''
};

// Convert a string to an 8 bit representation (like in PHP).
function to8bit(string)
{
	if (smf_charset == 'UTF-8')
	{
		var n, sReturn = '';

		for (var i = 0, iTextLen = string.length; i < iTextLen; i++)
		{
			n = string.charCodeAt(i);
			if (n < 128)
				sReturn += String.fromCharCode(n)
			else if (n < 2048)
				sReturn += String.fromCharCode(192 | n >> 6) + String.fromCharCode(128 | n & 63);
			else if (n < 65536)
				sReturn += String.fromCharCode(224 | n >> 12) + String.fromCharCode(128 | n >> 6 & 63) + String.fromCharCode(128 | n & 63);
			else
				sReturn += String.fromCharCode(240 | n >> 18) + String.fromCharCode(128 | n >> 12 & 63) + String.fromCharCode(128 | n >> 6 & 63) + String.fromCharCode(128 | n & 63);
		}

		return sReturn;
	}

	else if (string.oCharsetConversion.from.length == 0)
	{
		switch (smf_charset)
		{
			case 'ISO-8859-1':
				string.oCharsetConversion = {
					from: '\xa0-\xff',
					to: '\xa0-\xff'
				};
			break;

			case 'ISO-8859-2':
				string.oCharsetConversion = {
					from: '\xa0\u0104\u02d8\u0141\xa4\u013d\u015a\xa7\xa8\u0160\u015e\u0164\u0179\xad\u017d\u017b\xb0\u0105\u02db\u0142\xb4\u013e\u015b\u02c7\xb8\u0161\u015f\u0165\u017a\u02dd\u017e\u017c\u0154\xc1\xc2\u0102\xc4\u0139\u0106\xc7\u010c\xc9\u0118\xcb\u011a\xcd\xce\u010e\u0110\u0143\u0147\xd3\xd4\u0150\xd6\xd7\u0158\u016e\xda\u0170\xdc\xdd\u0162\xdf\u0155\xe1\xe2\u0103\xe4\u013a\u0107\xe7\u010d\xe9\u0119\xeb\u011b\xed\xee\u010f\u0111\u0144\u0148\xf3\xf4\u0151\xf6\xf7\u0159\u016f\xfa\u0171\xfc\xfd\u0163\u02d9',
					to: '\xa0-\xff'
				};
			break;

			case 'ISO-8859-5':
				string.oCharsetConversion = {
					from: '\xa0\u0401-\u040c\xad\u040e-\u044f\u2116\u0451-\u045c\xa7\u045e\u045f',
					to: '\xa0-\xff'
				};
			break;

			case 'ISO-8859-9':
				string.oCharsetConversion = {
					from: '\xa0-\xcf\u011e\xd1-\xdc\u0130\u015e\xdf-\xef\u011f\xf1-\xfc\u0131\u015f\xff',
					to: '\xa0-\xff'
				};
			break;

			case 'ISO-8859-15':
				string.oCharsetConversion = {
					from: '\xa0-\xa3\u20ac\xa5\u0160\xa7\u0161\xa9-\xb3\u017d\xb5-\xb7\u017e\xb9-\xbb\u0152\u0153\u0178\xbf-\xff',
					to: '\xa0-\xff'
				};
			break;

			case 'tis-620':
				string.oCharsetConversion = {
					from: '\u20ac\u2026\u2018\u2019\u201c\u201d\u2022\u2013\u2014\xa0\u0e01-\u0e3a\u0e3f-\u0e5b',
					to: '\x80\x85\x91-\x97\xa0-\xda\xdf-\xfb'
				};
			break;

			case 'windows-1251':
				string.oCharsetConversion = {
					from: '\u0402\u0403\u201a\u0453\u201e\u2026\u2020\u2021\u20ac\u2030\u0409\u2039\u040a\u040c\u040b\u040f\u0452\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u2122\u0459\u203a\u045a\u045c\u045b\u045f\xa0\u040e\u045e\u0408\xa4\u0490\xa6\xa7\u0401\xa9\u0404\xab-\xae\u0407\xb0\xb1\u0406\u0456\u0491\xb5-\xb7\u0451\u2116\u0454\xbb\u0458\u0405\u0455\u0457\u0410-\u044f',
					to: '\x80-\x97\x99-\xff'
				};
			break;

			case 'windows-1253':
				string.oCharsetConversion = {
					from: '\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u2030\u2039\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u2122\u203a\xa0\u0385\u0386\xa3-\xa9\xab-\xae\u2015\xb0-\xb3\u0384\xb5-\xb7\u0388-\u038a\xbb\u038c\xbd\u038e-\u03a1\u03a3-\u03ce',
					to: '\x80\x82-\x87\x89\x8b\x91-\x97\x99\x9b\xa0-\xa9\xab-\xd1\xd3-\xfe'
				};
			break;

			case 'windows-1255':
				string.oCharsetConversion = {
					from: '\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u2039\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u203a\xa0-\xa3\u20aa\xa5-\xa9\xd7\xab-\xb9\xf7\xbb-\xbf\u05b0-\u05b9\u05bb-\u05c3\u05f0-\u05f4\u05d0-\u05ea\u200e\u200f',
					to: '\x80\x82-\x89\x8b\x91-\x99\x9b\xa0-\xc9\xcb-\xd8\xe0-\xfa\xfd\xfe'
				};
			break;

			case 'windows-1256':
				string.oCharsetConversion = {
					from: '\u20ac\u067e\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0679\u2039\u0152\u0686\u0698\u0688\u06af\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u06a9\u2122\u0691\u203a\u0153\u200c\u200d\u06ba\xa0\u060c\xa2-\xa9\u06be\xab-\xb9\u061b\xbb-\xbe\u061f\u06c1\u0621-\u0636\xd7\u0637-\u063a\u0640-\u0643\xe0\u0644\xe2\u0645-\u0648\xe7-\xeb\u0649\u064a\xee\xef\u064b-\u064e\xf4\u064f\u0650\xf7\u0651\xf9\u0652\xfb\xfc\u200e\u200f\u06d2',
					to: '\x80-\xff'
				};
			break;

			default:
				string.oCharsetConversion = {
					from: '',
					to: ''
				};
			break;
		}
		var funcExpandString = function (sSearch) {
			var sInsert = '';
			for (var i = sSearch.charCodeAt(0), n = sSearch.charCodeAt(2); i <= n; i++)
				sInsert += String.fromCharCode(i);
			return sInsert;
		};
		string.oCharsetConversion.from = string.oCharsetConversion.from.replace(/.\-./g, funcExpandString);
		string.oCharsetConversion.to = string.oCharsetConversion.to.replace(/.\-./g, funcExpandString);
	}

	var sReturn = '', iOffsetFrom = 0;
	for (var i = 0, n = string.length; i < n; i++)
	{
		iOffsetFrom = string.oCharsetConversion.from.indexOf(string.charAt(i));
		sReturn += iOffsetFrom > -1 ? string.oCharsetConversion.to.charAt(iOffsetFrom) : (string.charCodeAt(i) > 127 ? '&#' + string.charCodeAt(i) + ';' : string.charAt(i));
	}

	return sReturn
}


// Character-level replacement function.
function php_strtr (string, sFrom, sTo)
{
	return string.replace(new RegExp('[' + sFrom + ']', 'g'), function (sMatch) {
		return sTo.charAt(sFrom.indexOf(sMatch));
	});
}


function php_strtolower(string)
{
	return typeof(smf_iso_case_folding) == 'boolean' && smf_iso_case_folding == true ? php_strtr(string,
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ\x8a\x8c\x8e\x9f\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde',
		'abcdefghijklmnopqrstuvwxyz\x9a\x9c\x9e\xff\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe'
	) : php_strtr(string, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz');
}

exports.set = function (charset, folding) {
  smf_iso_case_folding = folding;
  smf_charset = charset;
}

exports.hash = function (username, password, cur_session_id) {
  return sha1(sha1(php_strtolower(to8bit(username)) + to8bit(password)) + cur_session_id);
}
