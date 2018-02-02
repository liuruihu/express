var express = require('express');
var app = express();
app.set('port',process.env.PORT || 3000);

//引入'幸运虚拟饼干'模块
var fortune = require('./library/fortune.js');


/*开始
*设置handlebars视图引擎
*/
var handlebars = require('express3-handlebars')
                .create({
                    defaultLayout:'main'
                });

app.engine('handlebars',handlebars.engine);
app.set('views','./views/layouts');//这个书上没写，可能指的是路径
app.set('view engine','handlebars');
/*结束
*设置handlebars视图引擎
*/

app.use(express.static(__dirname +'/public'));


/*开始
*设置路由
*/

    //测试页面的路由设置
    app.use(function(req,res,next){
        res.locals.showTests = app.get('env') !== 'production' && req.query.test ==='1';

        next();
    });


    //首页
    app.get('/',function(req,res){
        // res.type('text/plain');
        // res.send('Meadowlark Travel,首页');
        res.render('home');
    });

    //关于页面about
    app.get('/about',function(req,res){
        // res.type('text/plain');
        // res.send('About Meadowlark Travel,关于页面');
        res.render('about',{
            fortune:fortune.getFortune(),
            pageTestScript:'/qa/tests-about.js'
        });
    });

    //定制404页面
    app.use(function(req,res){
        // res.type('text/plain');
        res.status(404);
        // res.send('404 - Not Found');
        var str='';
        for(var name in req.headers){
            str+=name+'='+req.headers[name]+';';
        }

        res.render('404',{
            content:str
        });
        // res.render(str);
    });

    //定制500页面
    app.use(function(err,req,res,next){
        console.log(err.stack);
        // res.type('text/plain');
        res.status(500);
        // res.send('500 - Server Error');
        res.render('500');
    });
/*结束
*设置路由
*/





app.listen(app.get('port'),function(){
    console.log('Express started on http://localhost:'+app.get('port')+'; press Ctrl-C to terminate.');
});
