describe("Background", function() {

	describe("When Getting a local store value, ", function() {

		it("getting a value from a key should return the correct fallback value", function() {

			expect( mmj.getLocalStore("i_dont_exist_no_fallback") ).toBeNull();

			expect( mmj.getLocalStore("i_dont_exist",0,"Fallback") ).toBe('Fallback');

			expect( mmj.getLocalStore("TESTVALUE",0,"CDE") ).toBe('ABC');

		});
		it("getting a value from a key starting with password should return plain text", function() {
			var rawPass = "MY-PASSWORD",
				pass = window.btoa( rawPass );

			expect( pass ).not.toBe( rawPass );

			expect( mmj.getLocalStore("PASSWORD_TESTING_234", 0, pass) ).toBe( rawPass );

		});

        it("parsing in a function should apply that function to the result", function() {

            expect( mmj.getLocalStore("i_dont_exist", function(val){return parseInt(val, 10); }, '1') ).toEqual( 1 );
            expect( mmj.getLocalStore("i_dont_exist", function(val){return val.toString(); }, 10) ).toBe( '10' );
            expect( mmj.getLocalStore("i_dont_exist", 0, '10' ) ).toBe( '10' );

        });

	});
	describe("When Setting a local store value", function() {
		var rawPass = "MY-PASSWORD";
		beforeEach(function() {
			mmj.setLocalStore("PASSWORD_TESTING_1234", rawPass );
		});

		afterEach(function() {
			mmj.resetLocalStore("PASSWORD_TESTING_1234");
		});

		it("a key starting with password should not save as plain text", function() {
			expect( localStorage.getItem("PASSWORD_TESTING_1234") ).not.toBe( rawPass );
			expect( mmj.getLocalStore("PASSWORD_TESTING_1234") ).toBe( rawPass );
		});

	});
	describe("When setting the browser status text ", function() {

		it("a negative number or non string value should return ?", function() {
			expect( mmj.updateBrowserActionStatus( -1 ) ).toBe( '?' ) ;
			expect( mmj.updateBrowserActionStatus( null ) ).toBe( '?' ) ;
			expect( mmj.updateBrowserActionStatus() ).toBe( '?' ) ;
		});
	});




	describe("When getting the view URLs ", function() {
        var data = [{"title":"My title","url":"http://one"},{"title":"My title","url":"http:// my jenkins /path/to/view"}];
        it("should get the first url where it exist ", function() {
            expect( mmj.getMainUrl( data ) ).toEqual( "http://one" );
        });
        it("should get the fall back url ", function() {
            expect( typeof(mmj.getMainUrl( [] )) ).toEqual( typeof('string') );
        });
        it("should get all view urls ", function() {
            expect( mmj.getViewsList( data ).length ).toEqual( 2 );
        });
	});



    describe("When getting a URL ", function() {
        it("should remove double slashes ", function() {
            expect( mmj.urlCleaner( 'http://someurl///blah/' ) ).toEqual( "http://someurl/blah/" );
        });
    });

    describe("When escaping a URL ", function() {
        it("should escape string if they are the last in the url path ", function() {
            expect( mmj.util.escape( 'http://someurl///blah/im escaped/' )  ).toEqual( "http://someurl///blah/im%20escaped/" );
            expect( mmj.util.escape( 'http://someurl///blah/im%20escaped/' )  ).toEqual( "http://someurl///blah/im%20escaped/" );
            expect( mmj.util.escape( 'http://someurl///blah/im not escaped/but i am/' )  ).toEqual( "http://someurl///blah/im not escaped/but%20i%20am/" );
        });
        it("should not double escape string if user adds an escaped url", function() {
            expect( mmj.util.escape( ' /' )  ).toEqual( "%20/" );
            expect( mmj.util.escape( '%20/' )  ).toEqual( "%20/" );
        });
        it("should append a final / to the end of the url if needed", function() {
            expect( mmj.util.escape( 'http://someurl/blah/' )  ).toEqual( "http://someurl/blah/" );
            expect( mmj.util.escape( 'http://someurl/blah' )  ).toEqual( "http://someurl/blah/" );
        });
    });

});