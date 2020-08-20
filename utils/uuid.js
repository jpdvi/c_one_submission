const crypto     = require('crypto');

module.exports = function(iter)
{
    (!iter) ? iter=5 : iter=iter;
    let _uuid = ``
    for (var i = 0; i < iter; i++) {
      if (i < iter-1)
      {
        _uuid = _uuid+crypto.randomBytes(5).toString('hex')+'-'
      }
      else{
        _uuid = _uuid+crypto.randomBytes(5).toString('hex');
      }
    }
    return _uuid;
}
