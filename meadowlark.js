var express = require('express');
var app = express();

//设置服务器运行环境
// app.set('env','production');

//根据不同的环境，日志的表现形式有点不同----但我还没看出来哪里不同
switch(app.get('env')){
    case 'development':
        //紧凑的，彩色的开发日志
        //这里的作用是当你显示不同页面的收获，开发日志会显示加载了那些资源，什么状态
        app.use(require('morgan')('dev'));

        break;
    case 'production':
        //模块'express-logger'支持按日志循环
        app.use(require('express-logger')({
            path:__dirname+'/log/requests.log'
        }));

        break;
}

/*
*未捕获异常错误处理--域:-->说是放在所有路由和中间件的前面
*/
app.use(function(req,res,next){
    //为这个请求创建一个域
    var domain=require('domain').create();
    //处理这个域中的错误
    domain.on('error',function(err){
        console.log('DOMAIN ERROR CAUGHT\n',err.stack);
        try{
            //在5秒内进行故障保护关机
            setTimeout(function(){
                console.err('Failsafe shutdown.');
                process.exit(1);
            },5000);

            //从集群中断开
            var worker=require('cluster').worker;
            if(worker) worker.disconnect();

            //停止接收新请求
            server.close();

            try{
                //尝试使用Express错误路由
                next(err);
            }catch(err){
                //如果Express错误路由失败，尝试返回普通文本响应
                console.log('Express error mechanism failed.\n',err.stack);
                res.statusCode=500;
                res.setHeader('content-type','text/plain');
                res.end('Server error');
            }
        }catch(err){
            console.log('Unable to send 500 response.\n',err.stack);
        }
    });

    //向域中添加请求和相应对象
    domain.add(req);
    domain.add(res);

    //执行该域中剩余的请求链
    domain.run(next);
});

//







/*
*不同工作线程处理不同请求的证据，看到的是'没有东西'，不清楚cluster.isWorker什么时候为真
*/
app.use(function(req,res,next){
    var cluster=require('cluster');

    if(cluster.isWorker){
        // console.log('有东西');
        console.log('Worker %d received request',cluster.worker.id);
    }else{
        // console.log('没有东西');
    }
    next();
});









app.set('port',process.env.PORT || 3000);

//引入'幸运虚拟饼干'模块
var fortune = require('./library/fortune.js');

//上传文件使用的formidable
var formidable=require('formidable');


//jquery 文件上传的，上传图片的缩略图包
var  jqupload= require('jquery-file-upload-middleware');

//引入凭证(cookie方面)
var credentials=require('./credentials.js');

var nodemailer = require('nodemailer');

/*
*设置邮件传输实例，下面两个，用其中一个，参数记得改成正确的
*/
// var mailTransport = nodemailer.createTransport('SMTP',{
//     service:'Yahoo',
//     auth:{
//         user:credentials.gmail.user,
//         pass:credentials.gmail.password
//     }
// });


// var mailTransport = nodemailer.createTransport('SMTP',{
//     host:'smtp.meadowlarktravel.com',
//     secureConnection:true,   //用SSL端口：465
//     auth:{
//         user:credentials.gmail.user,
//         pass:credentials.gmail.password
//     }
// });


//测试
// 开启一个 SMTP 连接池
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
var mailTransport = nodemailer.createTransport(config_email);

// 设置邮件内容
var mailOptions = {
    from:'<liu1114846482@163.com>',
    to:'liuruihu@qifadai.com',
    // to:'3467276086@qq.com',
    // to:'liuruihu@ruilongjin.com',
    // to:'有尖括号<liu1114846482@163.com>,liuruihu@ruilongjin.com',
    // cc:'liuruihu@qifadai.com',
    // bcc:'3467276086@qq.com',
    subject:'测试QQ发送--附件--连接--图片--qq连接',
    // text:'这是普通邮件内容111111111',


    /*
    * attachments与icalEvent差不多，
    * 测试结果都是附件功能，
    * 只不过attachments是个数组，
    * 里面可以有好几个对象，
    * 也就是好几个附件，
    * 而icalEvent他就是一个对象
    */

    attachments:[
        {
            filename:'text0.txt',
            content:'hello world!!!!!!'
        },
        {
            filename:'text33333.txt',
            path:'./public/vendor/text.txt'
        },
        {
            filename:'图片一',
            path:'./public/img/logo.png',
            cid:'1'
        },
        {
            filename:'图片一',
            path:'./public/img/logo.png',
            cid:'2'
        }
    ],
    // icalEvent: {
    //     filename: 'invitation.txt',
    //     // method: 'request',
    //     content: '1111111111111'
    // },
    html:`
    <div id="mailContentContainer" class="qmbox qm_con_body_content qqmail_webmail_only" style="">
    <h1>邮件内容的title</h1>
    <p>邮件内容的内容</p>
    <a href="http://localhost:3000/about" target="_blank">点击到 草地鹨</a>
    <a href="http://www.blogjava.net/zjusuyong/articles/304788.html" target="_blank">点击到 http外连接</a>
    <a href="https://www.baidu.com/" target="_blank">点击到 https外连接</a>

        <style type="text/css">
        a{
            font-size:30px;
            color:red;
            display:block;
        }
        img{
            border:solid 10px blue;
            border-radius:50%;
        }
        </style>

        <img src='http://via.placeholder.com/180x220' alt='邮件图片'>
        <img src="http://localhost:3000/img/Meadowlark.png" alt="Logo" title="草地鹨">
        <img src='https://www.baidu.com/img/bd_logo1.png' alt='邮件图片' title="https外图片">

        <img src='cid:1' alt='cid' title="cid">
    </div>



        `



        // <a href='http://localhost:3000/about'>点击到 草地鹨</a>
        // <a href='http://www.blogjava.net/zjusuyong/articles/304788.html'>点击到 http外连接</a>
        // <a href='https://www.baidu.com/'>点击到 草地鹨</a>
        // <img src='http://via.placeholder.com/180x220' alt='邮件图片'>
        // <img src='https://www.baidu.com/img/bd_logo1.png' alt='邮件图片'>//在上面html里服务器老是报错
    //     ,
    // generateTextFromHtml:true//好像无效果，没看到html模式变成普通文本模式
    // ,date: new Date('2000-01-01 00:00:00')
}

// 发送邮件
// mailTransport.sendMail(mailOptions,function(err,info){
//     if(err)
//         console.log('失败',err);
//     else {
//         console.log('成功',info.response);
//     }
//     // mailTransport.close();
// });











//引入cookie的中间件cookie-parser中间件
var cookieParser=require('cookie-parser');

app.use(cookieParser(credentials.cookieSecret));


//node默认不支持req.body,为了使他可用，需要引入body-parser中间件
var bodyParser=require('body-parser');
app.use(bodyParser());

/*开始
*设置handlebars视图引擎
*/
var handlebars = require('express3-handlebars')
                .create({
                    defaultLayout:'main',
                    helpers:{
                        section:function(name,options){
                            if(!this._sections)this._sections={};
                            this._sections[name]=options.fn(this);
                            return null;
                        }
                    }
                    // ,extname:'.hbs'//这里是改文件名后缀的，除了.hbs，不知道可不可以自定义后缀名
                });

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.set('views','./views/layouts');//这个书上没写，可能指的是路径


// app.set('view cache', true);//没看出来有什么缓存的作用
/*结束
*设置handlebars视图引擎
*/

app.use(express.static(__dirname +'/public'));


/*开始
*设置路由
*/


    ////////////////////////////
    //给组件传值
    function getWeatherData(){
        return {
            locations:[
                {
                    name:'Portland',
                    forecastUrl:'http://www.wunderground.com/US/OR/Portland.html',
                    iconUrl:'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                    weather:'Overcast',
                    temp:'54.1 F(12.3 C)'
                },
                {
                    name:'Bend',
                    forecastUrl:'http://www.wunderground.com/US/OR/Bend.html',
                    iconUrl:'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                    weather:'Partly Cloudy',
                    temp:'54.1 F(12.3 C)'
                },
                {
                    name:'Manzanita',
                    forecastUrl:'http://www.wunderground.com/US/OR/Manzanita.html',
                    iconUrl:'http://icons-ak.wxug.com/i/c/k/rain.gif',
                    weather:'Light Rain',
                    temp:'54.1 F(12.3 C)'
                }
            ]
        }
    }
    //组件里传值
    app.use(function(req, res, next){
        if(!res.locals.partials) res.locals.partials = {};
        res.locals.partials.weather = getWeatherData();

        next();
    });

    //测试页面的路由设置
    app.use(function(req,res,next){
        res.locals.showTests = app.get('env') !== 'production' && req.query.test ==='1';

        next();
    });


    // app.disable('x-powered-by');
    //首页
    app.get('/',function(req,res){
        // res.type('text/plain');
        // res.send('Meadowlark Travel,首页');

        res.cookie('monster','nom nom');//设置cookie
        res.cookie('signed_monster','nom nom',{signed:true});//设置签名cookie,true的时候值为加密模式，默认为false

        res.cookie('cookie','1111111111');




        res.render('home',{
            signed_cookie:req.signedCookies.signed_cookie,
            cookie:req.cookies.cookie
        });
    });

    //关于页面about
    app.get('/about',function(req,res){
        // res.type('text/plain');
        // res.send('About Meadowlark Travel,关于页面');

        //测试删除首页种植的cookie
        // res.clearCookie('cookie');
        // res.clearCookie('cookie','signed_cookie');
        res.cookie('signed_cookie','222222222',{
            signed:true,
            httpOnly:true,
            maxAge:1000000,
            path:'/about'
        });
        res.render('about',{
            fortune:fortune.getFortune(),
            pageTestScript:'/qa/tests-about.js'
        });
    });



    //test测试页面
    app.get('/test:a',function(req,res){

        res.render('test',{
            currency:{
                name:'United States dollars',
                abbrev:'USD'
            },
            tours:[
                { name:'Hood River',price:'$99.99'},
                { name:'Oregon Coast',price:'$159.95'}
            ],
            specialsUrl:'/january-specials',
            currencies:['USD','GBP','BTC']
        });

    });

    //foo页面
    app.get('/foo',function(req,res){
        res.render('foo',{
            layout:null
        });
    });


    //使用其他模板
    app.get('/other',function(req,res){
        res.render('other',{
            layout:'otherLayout'
        });
    });


    //段落测试
    app.get('/jqueryTest',function(req,res){
        res.render('jqueryTest',{
            layout:'otherLayout'

        });
    });


    //第一个提交 表单页面，newsletter
    app.get('/newsletter',function(req,res){
        res.render('newsletter',{
            csrf:'我是隐藏的'
        });
    });
    //表单提交的数据，到这个页面
    app.post('/process',function(req,res){
        // console.log('Form (from querystring):'+req.query.query);
        // console.log('CSRF token (from hidden form field):'+req.body._csrf);
        // console.log('Name (from visible form field):'+req.body.name);
        // console.log('Email (from visible form field):'+req.body.email);
        // res.redirect(303,'/thank-you');
        if(req.xhr){
            res.send({
                success:true
            });
        }else{
            res.redirect(303,'/thank-you');
        }
    });



    //文件上传，这个案例是图片
    app.get('/contest/vacation-photo',function(req,res){
        var now=new Date();
        res.render('../contest/vacation-photo',{
            year:now.getFullYear(),
            month:now.getMonth()
        });
    });

    app.post('/contest/vacation-photo/:year/:month',function(req,res){
        var form=new formidable.IncomingForm();
        form.parse(req,function(err,fields,files){
            if(err) return res.redirect(303,'/error');

            console.log('received fields\n',fields,'\n','received files:\n',files);

            res.redirect(303,'/thank - you');
        });
    });


    //jquery文件上传中间件
    app.use('/upload',function(req,res,next){

        // now()方法返回自1970年1月1日 00:00:00 UTC到当前时间的毫秒数，类型为Number。
        // 因为 now() 是Date的一个静态函数，所以必须以 Date.now() 的形式来使用。
        var now=Date.now();


        jqupload.fileHandler({
            uploadDir:function(){
                return __dirname+'/public/upload/'+now;//这里设置文件上传到哪里的路径
            },
            //没有下面这些，照样能上传，不知怎么回事
            uploadUrl:function(){
                return '/upload/'+now;
            }
        })(req,res,next);
        // next();
    });


    // app.use(function(req,res,next){
    //     console.log('执行了');
    //     next();
    // });
    // app.use(function(req,res,next){
    //     console.log('再次执行了');
    //     res.send('谢谢使用1');
    //     // next();
    // });
    // app.use(function(req,res,next){
    //     // res.send('谢谢使用2');
    //     console.log('永远不会执行');
    // });


    // 感谢页面路由
    app.post('/cart/checkout',function(req,res){
        var cart=req.session.cart;
        if(!cart) next(new Error('Cart does not exist.'));
        var name=req.body.name ||'',
            email=req.body.email ||'';

        // 输入验证
        if(!email.match(VALID_EMAIL_REGEX))
            return res.nex(new Error('Invalid email address'));

        //分配一个随机的购物车ID，一般我们会用一个数据库ID
        cart.number = Math.random().toString().replace(/^0\.0*/,'');
        cart.billing = {
            name:name,
            email:email
        }

        res.render('email/cart-thank-you',
        {
            layout:null,
            cart:cart
        },function(err,html){
            if(err)
                console.log('error in email template');
            mailTransport.sendMail({
                from:'liu1114846482@163.com',
                to:cart.billing.email,
                subject:'Thank You for Book your trip with meadowlark',
                html:html,
                generateTextFromHtml:true
            },function(err){
                if(err)
                    console.log('Unable to send confirmation :'+err.stack);
            });
        });

        res.render('cart-thank-you',{cart:cart});

    });

    //感谢邮件模板
    app.get('/email/cart-thank-you',function(req,res){
        res.render('../email/cart-thank-you',{});
    });




    //处理未捕获异常
    app.get('/fail',function(req,res){
        throw new Error('Nope');
    });

    //更糟糕的错误处理
    app.get('/epic-fail',function(req,res){
        process.nextTick(function(){
            throw new Error('Kaboom!!');
        });
    });












    //定制404页面
    app.use(function(req,res){
        // res.type('text/plain');
        res.status(404);
        // res.send('404 - Not Found');
        var str='';
        for(var name in req.headers){
            str+=name+'='+req.headers[name]+';\\n';
        }

        var util=require('util');
        res.render('404',{
            content:str,
            str:util.inspect(req.query),
            key:req.query.a
        });
        // console.log(reqStr);
        // res.render(str);
    });

    //定制500页面
    app.use(function(err,req,res,next){
        var config_email = {
            host:'smtp.163.com',
            port:'25',
            auth:{
                user:'liu1114846482@163.com',
                pass:'liu19890708'//设立时网易邮箱授权码
            }
        }
        var mailTransport = nodemailer.createTransport(config_email);

        // 设置邮件内容
        var mailOptions = {
            from:'<liu1114846482@163.com>',
            to:'liuruihu@qifadai.com',
            subject:'出错了',
            text:'网站出问题了，赶快找专家看看！！！！'
        }

        // 发送邮件
        mailTransport.sendMail(mailOptions,function(err,info){
            if(err)
                console.log('失败',err);
            else {
                console.log('成功',info.response);
            }
            // mailTransport.close();
        });

        console.log(err.stack);
        // res.type('text/plain');
        res.status(500);
        // res.send('500 - Server Error');
        res.render('500',{
            a:'我就是那个数据'
        });
    });
/*结束
*设置路由
*/


console.log('运行的环境为：'+app.get('env'));



app.listen(app.get('port'),function(){
    console.log(`Express started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.`);
});
// function startServer(){
//     app.listen(app.get('port'),function(){
//         console.log(`Express started on http://localhost:${app.get('port')}; press Ctrl-C to terminate.`);
//     });
// }
//
// if(require.main===module){
//     //应用程序直接运行，启动应用服务器
//     console.log('直接运行');
//     startServer();
// }else{
//     //应用程序作为一个模块通过require引入，导出函数
//     //创建服务器
//     console.log('模块引入运行');
//     // module.exports=startServer;
// }
