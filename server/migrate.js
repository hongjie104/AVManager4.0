db.users.find({}, {
	account: 1,
	password: 1,
	mail: 1,
	phone: 1,
	birthday: 1
}).forEach(function (u) {
	print (`INSERT INTO db_account (is_guest,username,password,email,mobile,regtime,issn) `+
		   `VALUES (0, 'sn_${u.account}', '${u.password}', '${u.mail||''}', ${u.phone||0},`+
		   ` ${u.birthday?Math.floor(u.birthday.getTime()/1000):0}, 1);`);
});
