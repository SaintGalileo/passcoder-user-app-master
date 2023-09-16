// PG Age
const pg_age = 13;

// Bucket URL & User Bucket Url
const bucket_url = "gs://fls.passcoder.io/";
const user_bucket_url = bucket_url + "users/";

// Internal Key 
const internal_character_key = "2894xsl94ahj384273o0";

const allowed_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "application/pdf", "application/PDF"];
const allowed_image_extensions = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG"];
const maximum_file_size = 5 * 1024 * 1024;

const payment_methods = {
  card: "Credit/Debit Card",
  transfer: "Transfer",
  pos: "POS",
  wallet: "Wallet"
};

const send_payment_options = {
	passcoder_user: "Passcoder ID",
	bank_transfer: "Bank Transfer",
	passcoder_partner: "Business"
};

const default_profile_image = "https://fls.passcoder.io/user.png";
const passcoder_icon = "https://fls.passcoder.io/passcoder.png";

const verified_status = true;
const unverified_status = false;

const default_status = 1;
const default_delete_status = 0;
const default_pending_status = 2;
const default_timeout_status = 3;
const default_ineligible_status = 4;
const default_complete_status = 5;

// File lengths
const file_length_5Mb = 5 * 1024 * 1024;
// End - File lengths

const date_str = (date) => {
	const d = new Date(date);
	const date_str = d.getFullYear() + "-" + ((d.getUTCMonth() + 1) < 10 ? "0" + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate());
	return date_str;
};

const timestamp_str_alt = (date) => {
	const _d_stripped = date ? date.split(" ") : null;
	const d = _d_stripped ? new Date(_d_stripped[0] + "T" + _d_stripped[1]) : null;
	return d ? {
		fulldate: d.toDateString() + " at " + d.toLocaleTimeString(),
		date: d.toDateString(),
		time: d.toLocaleTimeString(),
	} : {
		fulldate: null,
		date: null,
		time: null,
	};
};

const date_str_alt = (date) => {
	const _d_ = date ? date : null;
	const d = _d_ ? new Date(_d_) : null;
	return d ? {
		fulldate: d.toDateString() + " at " + d.toLocaleTimeString(),
		date: d.toDateString(),
		time: d.toLocaleTimeString(),
	} : {
		fulldate: null,
		date: null,
		time: null,
	};
};

const test_all_regex = (data, regex) => {
	if (!data) {
		return false;
	}

	const valid = regex.test(data);
	if (!valid) {
		return false;
	}

	return true;
};

const random_numbers = (length) => {
	if (length === undefined || length === null || length === 0) {
		return 0;
	} else {
		let rand_number = "";
		for (let index = 0; index < length; index++) {
			rand_number += Math.floor(Math.random() * 10);
		}
		return rand_number;
	}
};

const validate_nin_and_bvn = (number) => {
	const tester = /^([0-9]{11})$/;
	return test_all_regex(number, tester);
};

const validate_nimc_document_number = (number) => {
	const tester = /^([0-9]{6,12})$/;
	return test_all_regex(number, tester);
};

const validate_nins_tracking_id = (number) => {
	const tester = /^([a-zA-Z0-9]{15,20})$/;
	return test_all_regex(number, tester);
};

const validate_vNIN = (number) => {
	const tester = /^([a-zA-Z0-9]{16})$/;
	return test_all_regex(number, tester);
};

const validate_driver_licence_number = (number) => {
	const tester = /^([a-zA-Z0-9]{6,20})$/;
	return test_all_regex(number, tester);
};

const validate_vin = (number) => {
	const tester = /^([a-zA-Z0-9]{15,20})$/;
	return test_all_regex(number, tester);
};

const validate_cac_and_tin_number = (number) => {
	const tester = /^([0-9]{7,14})$/;
	return test_all_regex(number, tester);
};

const validate_voter_card_number = (number) => {
	const tester = /^([a-zA-Z0-9]{9})$/;
	return test_all_regex(number, tester);
};

const validate_passport_number = (number) => {
	const tester = /^([a-zA-Z0-9]{6,9})$/;
	return test_all_regex(number, tester);
};

const validate_certification_number = (number) => {
	const tester = /^([a-zA-Z0-9\/\-]{3,50})$/;
	return test_all_regex(number, tester);
};

const validate_document_reference = (number) => {
	const tester = /^([a-zA-Z0-9\/\-]{3,50})$/;
	return test_all_regex(number, tester);
};

const validate_url = (url) => {
	const tester = /^((http|https):\/\/)(www.)?[a-zA-Z0-9@:%._\+~#?&//=]{2,256}((\.[a-z]{2,6})|([a-z0-9:]){2,10})\b([-a-zA-Z0-9@:%._\+~#?&//=]*)$/;
	return test_all_regex(url, tester);
};

const validate_email = (url) => {
	const tester = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
	return test_all_regex(url, tester);
};

const validate_phone_number = (url) => {
	const tester = /^(?:\+(?:[0-9]●?){6,14}[0-9])|([0][7-9][0-1][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9])$/;
	return test_all_regex(url, tester);
};

const validate_password = (url) => {
	const tester = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
	return test_all_regex(url, tester);
};

const validate_password_field_1 = (url) => {
	const tester = /^(?=.*[A-Z])(?=.*[a-z]).{8,}$/;
	return test_all_regex(url, tester);
};

const validate_password_field_2 = (url) => {
	const tester = /^(?=.*[0-9]).{8,}$/;
	return test_all_regex(url, tester);
};

const validate_password_field_3 = (url) => {
	const tester = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
	return test_all_regex(url, tester);
};

const validate_rc_number = (number) => {
	const tester = /^([0-9]{6,14})$/;
	return test_all_regex(number, tester);
};

const validate_polling_unit_code = (number) => {
	const tester = /^([0-9\-]{3,15})$/;
	return test_all_regex(number, tester);
};

const validate_pin = (number) => {
	const tester = /^([0-9]{4})$/;
	return test_all_regex(number, tester);
};

const validate_pg_age_signup = (dob) => {
	const d = new Date(dob);
	const today = new Date();
	const year_diff = today.getFullYear() - d.getFullYear();
	if (d == "Invalid Date") return false;
	if (year_diff < pg_age) return false;
	return true;
};

const validate_future_date = (date) => {
	const d = new Date(date);
	const today = new Date();
	if (d === "Invalid Date") return false;
	if (today.getTime() > d.getTime()) return false;
	return true;
};

const validate_past_date = (date) => {
	const d = new Date(date);
	const today = new Date();
	if (d === "Invalid Date") return false;
	if (today.getTime() < d.getTime()) return false;
	return true;
};

const validate_future_end_date = (_start, _end) => {
	const start = new Date(_start);
	const end = new Date(_end);
	if (start === "Invalid Date") return false;
	if (end === "Invalid Date") return false;
	if (start.getTime() >= end.getTime()) return false;
	return true;
};

const validate_future_end_date_alt = (_start, _end) => {
	const start = new Date(_start);
	const end = new Date(_end * 1000);
	if (start === "Invalid Date") return false;
	if (end === "Invalid Date") return false;
	if (start.getTime() >= end.getTime()) return false;
	return true;
};

const return_first_letter_uppercase = (str) => {
	return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

const return_first_letter_uppercase_alt = (_str) => {
	const str = unstrip_text(_str);
	return str.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

const return_all_letters_uppercase = (str) => {
	return str.toUpperCase();
};

const return_all_letters_lowercase = (str) => {
	return str.toLowerCase();
};

const return_trimmed_data = (str) => {
	return str.trim();
};

const digit_filter = (digits) => {
	return digits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const mask_string = (character) => {

	if (!character) return null;

	let _character = character;
	let _length = _character.length;

	let asterisks = "";
	for (let index = 0; index < _length; index++) {
		asterisks += "*";
	}
	return asterisks;
};

const count_filter = (count) => {
	if (isNaN(count)) return count = 0;

	if (count < 1000) return count;

	count /= 1000;

	if (count < 1000) return count.toFixed(1) + ' k';

	count /= 1000;

	if (count < 1000) return count.toFixed(1) + ' m';

	count /= 1000;

	if (count < 1000) return count.toFixed(1) + ' b';

	count /= 1000;

	return count.toFixed(1) + ' tn';
};

export { 
	pg_age, verified_status, unverified_status, default_status, default_delete_status, default_pending_status, default_timeout_status, default_ineligible_status, file_length_5Mb, date_str_alt, 
	default_complete_status, test_all_regex, validate_nin_and_bvn, validate_nimc_document_number, validate_nins_tracking_id, validate_vNIN, validate_driver_licence_number, date_str, digit_filter, 
	validate_vin, validate_cac_and_tin_number, validate_voter_card_number, validate_passport_number, validate_certification_number, validate_document_reference, validate_url, timestamp_str_alt,
	validate_rc_number, validate_polling_unit_code, validate_pin, validate_pg_age_signup, validate_future_date, validate_past_date, validate_future_end_date, validate_future_end_date_alt, 
	validate_email, validate_phone_number, validate_password, return_first_letter_uppercase, return_first_letter_uppercase_alt, return_all_letters_uppercase, return_all_letters_lowercase, 
	bucket_url, user_bucket_url, allowed_extensions, maximum_file_size, allowed_image_extensions, return_trimmed_data, random_numbers, default_profile_image, passcoder_icon, internal_character_key, 
	count_filter, payment_methods, validate_password_field_1, validate_password_field_2, validate_password_field_3, mask_string, send_payment_options
};
