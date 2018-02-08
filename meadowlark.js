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
