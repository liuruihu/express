var app=require('express')();

var nodemailer = require('nodemailer');

var config_email = {
    host:'smtp.163.com',
    port:'465',
    // port:'25',
    // secure:false,//默认为false
    secure:true,
    // secureConnection:true,
    auth:{
        user:'liu1114846482@163.com',
        pass:'liu19890708'//设立时网易邮箱授权码
    }
}
var transporter=nodemailer.createTransport(config_email);
var data={
    from:'liu1114846482@163.com',
    to:'liu1114846482@163.com,liuruihu@ruilongjin.com',
    cc:'liuruihu@qifadai.com',
    subject:'163邮箱测试标题--secure--true--port--465',
    html:'测试成功'
}
transporter.sendMail(data,function(err,info){
    console.log(err);
    if(err)
        console.log('失败',err);
    else {
        console.log('成功',info.response);
    }
    // transporter.close();
});





















app.use(function(req,res,next){
    console.log('开始');
    next();
});

app.get('/a',function(req,res,next){
    console.log('/a：路由终止');
    res.send('a');
    // next();
});
app.get('/a',function(req,res){
    console.log('/a：永远不会调用');
});

app.get('/b',function(req,res,next){
    console.log('/b：路由未终止');
    next();
});
app.use(function(req,res,next){
    console.log('SOMETIMES');
    next();
});
app.get('/b',function(req,res,next){
    console.log('/b(part 2)：抛出错误');
    throw new Error('b 失败1');
});
app.use('/b',function(err,req,res,next){
    console.log('/b: 检测到错误并传递');
    throw new Error('b 失败2');
});

app.get('/c',function(err,req){
    console.log('/c：抛出错误1');
    throw new Error('c 失败');
});
app.use('/c',function(err,req,res,next){
    console.log('/c：检测到错误但不传递');
    next();
});

app.use(function(err,req,res,next){
    console.log('检测到未处理的错误：'+err.message);
    res.send('500 - 服务器错误');
});
app.use(function(req,res){
    console.log('未处理的路由');
    res.send('404 - 未找到');
});

app.listen(4000,function(){
    console.log('监听端口4000');
});
