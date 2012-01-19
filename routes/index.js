
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'WebRTC sample' })
};
exports.get_user_media = function(req, res){
  res.render('get_user_media', { title: 'WebRTC sample', subtitle: 'getUserMedia' })
};
