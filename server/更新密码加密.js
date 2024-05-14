// 查询user_table表中的数据
db.query('SELECT id, password FROM user_table', (error, results, fields) => {
  if (error) throw error;

  // 对每条记录的密码字段应用bcrypt加密并更新回数据库
  results.forEach(async (row) => {
    const id = row.id;
    const password = row.password;

    try {
      const hashedPassword = await bcrypt.hash(password, 10); // 10 是加密强度
      // 将加密后的密码更新回数据库
      db.query('UPDATE user_table SET password = ? WHERE id = ?', [hashedPassword, id], (error, results, fields) => {
        if (error) throw error;
        console.log(`User with id ${id} - password has been updated.`);
      });
    } catch (err) {
      console.error('Error occurred during password hashing:', err);
    }
  });
});