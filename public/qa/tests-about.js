// suite('About Page Tests',function(){
//     test('page should contain link to contact page',function(){
//         assert($('a[href="/contact"]').length);
//     });
// });目前没看到书上说的效果


//*
//*这里的两行字符串也不能改的，否则代码无效，这里不理解
//*
suite('Global Tests',function(){                                                            
    test('page has a valid title',function(){
        assert($('a[href="/contact"]').length);
    });
});
