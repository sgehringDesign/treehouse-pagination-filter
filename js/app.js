

// SEARCH FILTER & PAGINATION ====================================================================================
//-- DESCRIPTION: UNOBTRUSSIVE NON JQUERY PAGINATION BASED ON PRELOADED DOM ELEMENTS

//-- NOTES: 
//---- 1) For improved code clarity... I think I am going to start noting private properties as "[Obj name]_[Type]_[PropertyName]"
//---- 2) At this point not sure why I need public properties as changing them outside the object seems to introduce risk of issues...
//---- 3) I am missing jquery or mootools right about now....



document.addEventListener("DOMContentLoaded", function(event) {



  // DATA OBJECT ============================================================================================================================================
  //-- DESCRIPTION: Object that stroes the printed results from the DOM and the page state.

  //-- NOTES: Spent about several hours on this one...  

  //-- PRIVATE METHODS:
  //----- loadData() : loads elements on the dom and the data from the feed

  //-- PUBLIC METHODS:
  //----- getState() : Get the state of data
  //----- getLength() : Get the length of stored data and returns a int
  //----- getDataItem(int_index) : Get one item from the data array - argument must be a integer for a int_index - returns false or a domElement from the data array
  //----- getDataSegment(int_begin, int_end ) : Get a segment from the data array - argument for begning and end must be a integer - returns false or an array of domElements
  //----- searchData(str_term, selector) : Search dom element in the array based on the value in str_term - argument for str_term and selector must be a string - returns false or an array of domElements 

  var obj_DOMDataModule = (function(exports) {
    'use strict';


    // PROPERTIES (PUBLIC) ___________________________________________________________________________________________________
    var exports = {
      selector: '.student-item',
 
    }

     // PROPERTIES (PRIVATE) ___________________________________________________________________________________________________
    var _ = {
      loaded: false,  // 'unloaded' || 'loaded'
      data: [],
    }


    // METHODS (PRIVATE) ______________________________________________________________________________________________________

    // LOAD THE DATA FROM THE DOM (PRIVATE) -------------------------------------------------------------------
    !(function() {
      _.data = [].slice.call( document.querySelectorAll( exports.selector ) );  // Load All Students from the DOM
      _.loaded = true;
    }());



    // METHODS (PUBLIC) ________________________________________________________________________________________________________

    // GET DATA LENGTH (PUBLIC)-----------------------------------------------------------------------------------
    exports.isLoaded= function() {
      return _.loaded;
    }


    // GET DATA LENGTH (PUBLIC)-----------------------------------------------------------------------------------
    exports.getLength = function() {
      return _.data.length;
    }


    // GET DATA ITEM (PUBLIC)-----------------------------------------------------------------------------------
    exports.getDataItem = function(int_index) {
      
      //Type check for int
      if(!(int_index === parseInt(int_index, 10))) {
        console.error( 'obj_DOMDataModule.getDataItem() : Bad type passed for "int_index". This needs to be a int');
        return false;
      }

      // Check for number lager then current data size
      if(_.data.length < int_index || 0 > int_index) {
        console.warn( 'obj_DOMDataModule.getDataItem() : Passed "int_index" value is out of range of the loaded data array');
        return false;
      }

      return data[int_index];
    }


    // GET DATA FROM THE OBJECT (PUBLIC) ------------------------------------------------------------------------
    exports.getDataSegment = function(int_begin, int_end ) {

      //Type check for int_begin
      if(!(int_begin === parseInt(int_begin, 10))) {
        console.error( 'obj_DOMDataModule.getDataSegment() : Bad type passed for "int_begin". This needs to be a int');
        return false;
      }

       //Type check for int_end
      if(!(int_end === parseInt(int_end, 10))) {
        console.error( 'obj_DOMDataModule.getDataSegment() : Bad type passed for "int_end". This needs to be a int');
        return false;
      }

      // Check for int_begin lager then current data size
      if(_.data.length < int_begin || 0 > int_begin) {
        console.warn( 'obj_DOMDataModule.getDataItem() : Passed "int_begin" value is out of range of the loaded data array');
        return false;
      }

      return _.data.slice( int_begin, int_end );

    }
    
    
    // SEARCH DATA FROM THE OBJECT (PUBLIC) ----------------------------------------------------------------------
    exports.searchData = function(str_term, selector) {


      //Type check for str_term to string
      if(typeof str_term !== "string") {
        console.error( 'obj_DOMDataModule.searchData() : Bad type passed for "str_term". This needs to be a string');
        return;
      }

      //Type check for selector to string
      if(typeof selector !== "string") {
        console.error( 'obj_DOMDataModule.searchData() : Bad type passed for "selector". This needs to be a string');
        return;
      }


      //Check for blank search term
      if( str_term.length === 0) {
        return false;
      }


      // Filter search the array of DOM elements to find a match
      var ary_results = _.data.filter( function (domElement, index) {

        var value = domElement.querySelector(selector).innerHTML;  // get inner string to be searched in dom element

        // Search term index of to check form match
        if( value.indexOf(str_term) == 0) {
          return domElement; // return element to array
        } 

      });

      return ary_results;

    }


    return exports;


  }( obj_DOMDataModule || {} ));


  // console.log( obj_DOMDataModule);
  // console.log( obj_DOMDataModule.getLength());
  // console.log( obj_DOMDataModule.getDataItem(1));
  // console.log( obj_DOMDataModule.getDataSegment(-1, 200));
  // console.log( obj_DOMDataModule.searchData('a', 'h3'));
  



















  // PAGE FEED ============================================================================================================================================
 
  var obj_Feed = (function(exports) {
    'use strict';

    // SET PROPERTIES (PUBLIC) ___________________________________________________________________________________________________
    var exports = {
      selector: '.student-list',
      displayed: 10,
    }

    // SET PROPERTIES (PRIVATE) ___________________________________________________________________________________________________
    var _ = {
      total: 0,
      pages: 0,
      state: 'unloaded',
      current: {
        type : 'page',
        value: 0,
      },
      feed: document.querySelector( exports.selector),
      paging: {
        selector: '.pagination',
        domElement: document.createElement('div'),
      },
      data: [],
    }



    // METHODS (PRIVATE) ________________________________________________________________________________________________________


    // LOAD URL BOOKMARK (PRIVATE) -------------------------------------------------------------------
    !(function() {

      if(window.location.hash.length < 1) {
        return;
      }

      _.current.value = window.location.hash.substr(1);

      if(!isNaN(_.current.value) && parseInt(Number(_.current.value)) == _.current.value && !isNaN(parseInt(_.current.value, 10))) {
        _.current.value = _.current.value - 1;
        _.current.type = 'page';
      } else {
        _.current.type = 'search';
      }

    }());


    // CHECK FOR obj_DOMDataModule (PRIVATE) -------------------------------------------------------
    // I put this in obj_DOMDataModule so one widget does not change the data. The data is more protected. 
    !(function() {

      if(typeof obj_DOMDataModule === "undefined") {
        console.error( 'obj_Feed._init() : obj_DOMDataModule is undefined');
        return exports;
      }

      if(!obj_DOMDataModule.isLoaded()) {
        console.error( 'obj_Feed._init() : obj_DOMDataModule not loaded');
        return exports;
      } 

      if(_.current.type === 'search' ) {
        _.data = obj_DOMDataModule.searchData( _.current.value, 'h3');
        _.total = _.data.length;
        _.pages = Math.ceil( _.total / exports.displayed );
      }

      if(_.current.type === 'page' ) {
        _.total = obj_DOMDataModule.getLength();
        _.pages = Math.ceil( _.total / exports.displayed );
        _.data = obj_DOMDataModule.getDataSegment( ( _.current.value * exports.displayed ), ( ( _.current.value * exports.displayed ) + exports.displayed) );
      }


    }());


    _.clearFeed = function () {
      _.feed.innerHTML = '';

      var obj_current_active = _.paging.domElement.querySelectorAll('.active');

      for(var i=0, len=obj_current_active.length; i < len; i++){
        obj_current_active[i].classList.remove('active');
      }

    }


    _.getDataSegment = function (page, displayed) {
      return obj_DOMDataModule.getDataSegment( ( page * displayed ), ( ( page * displayed ) + displayed) );
    }


    // METHODS (PUBLIC) ________________________________________________________________________________________________________

    _.renderFeed = function (pagedData) {

      // For loop the spliced "ary_Current_Page_Data" and add to the feed UL to render the new paged results
      for(var i=0, len=pagedData.length; i < len; i++){
        _.feed.appendChild( pagedData[i] ); 
      }

    }

    _.newPage = function (pagedData) {

      _.clearFeed();
      this.classList.add('active');                                                                 // Add active to current clicked item
      _.renderFeed( _.getDataSegment( (this.innerHTML - 1),  exports.displayed) );             // Render current data

    }


    _.renderPagination = function (total, current) {

      // Create temp obj variable to build pagination list elements
      var obj_ul = document.createElement('ul');                            // Define UL Element - More for Clarity
      var obj_li = document.createElement('li');                            // Define Li Element - More for Clarity
      var obj_a  = document.createElement('a');                             // Define A Element  - More for Clarity

      // Add class to pagination wrapper DIV
      _.paging.domElement.classList.add( _.paging.selector.substr(1) );     // Add Class
      

      for(var i=0, len=total; i < len; i++) {

        obj_li = document.createElement('li');                              // Reset Li Element
        obj_a  = document.createElement('a');                               // Reset A Element
        obj_a.innerHTML = (i+1);                                            // Add innerHTML
        obj_a.setAttribute('href', '#'+(i+1));                              // Add HREF attribute

        
        if(current == i) {
          obj_a.classList.add('active');                                    // Add class active
        }

        obj_a.addEventListener("click", _.newPage, false);
        obj_li.appendChild(obj_a);                                          // Append A tag to UL
        obj_ul.appendChild(obj_li);                                         // Append LI tag to UL

      }

      _.paging.domElement.appendChild(obj_ul);                              // Add UL pagination list to the pagination div 
      _.feed.parentNode.appendChild( _.paging.domElement );                 // Add pagination widget to the DOM

    }


    _.renderSearch = function () {

      var obj_header = document.querySelector('.page-header');
      var obj_div = document.createElement('div');
      var obj_input = document.createElement('input');
      var obj_button = document.createElement('button');

      obj_div.classList.add( 'student-search' );
      obj_input.setAttribute('placeholder', 'Search for students...' );
      
      if(_.current.type === 'search') {
        obj_input.value = _.current.value;
      }
      
      obj_button.innerHTML = 'Search';
      //obj_button.addEventListener("click", newSearch, false); 

      obj_div.appendChild(obj_input);
      obj_div.appendChild(obj_button);

      obj_header.appendChild( obj_div );

    }


    !(function() {

      _.clearFeed();
      _.renderSearch();
      _.renderFeed(_.data);

      if( _.total > exports.displayed ) {
        _.renderPagination( _.pages, _.current.value );
      }

    }());
    

    return exports;


  }( obj_Feed || {} ));























/*




  // SEARCHFILTER ====================================================================================
  //-- DESCRIPTION: Adds search filter and filter results.
  
  //-- NOTES: Spent about several hours on this one...  
  //---- Over time I think I could rewrite the code agian to be easier to read. 
  //---- I wrote this so over time properties can be pased in on instatiation
  //---- For now needs to be loaded before pagination.  I feel like I would need to write a data object that both modules to reffernce fix this bug

  //-- PROPERTIES:
  
  //---- feed (object) : stores data reguarding the feed of data 
  //-------- ul (object) : the object that store the feed ul selector and DOM object for later reference
  //------------ selector (string) : the string that stores the feed classname selector
  //------------ domElement (object) : the domElement that stores the feed ul element
  //-------- li (object) : the object that store information about the feed li elements 
  //------------ selector (string) : the string that stores the feed li classname selector
  //-------- data (array) : the data pulled from the dom
  
  //---- search (object) : stores data reguarding the search module
  //-------- header (object) : the object that store the header div selector and DOM object for later reference
  //------------ selector (string) : the string that stores the header classname selector
  //------------ domElement (object) : the domElement that stores the header element for later reference
  //-------- div (object) : the object that stores search wrapper div info
  //------------ selector (string) : the string that stores the search wrapper classname selector
  //------------ domElement (string) :  the domElement that stores the header element for later reference
  //-------- input (object) : the object that stores input info
  //------------ placeholder (string) : the string that stores the input placeholder attribute
  //------------ domElement (string) :  the domElement that stores the input element for later reference
  //-------- button (object) : the object that stores button info
  //------------ text (string) : the string that stores the button innnerhtml string
  //------------ domElement (string) :  the domElement that stores the button element for later reference


  //-- PRIVATE METHODS:
  //----- loadFeedData() : loads elements on the dom and the data from the feed
  //----- removeActivePage() : removes active state from pages after search button has been clicked
  //----- newSearch() : searchs the data in the feed to find matches and renders the matches into the feed
  //----- renderSearchFilter() : add the search widget to the page

  
  var searchfilterGenerator = function() {


    // SET PROPERTIES (PRIVATE) ___________________________________________________________________________________________________
    var SearchFilter = {
      
      feed: {
        ul: {
          selector: '.student-list',
          domElement: document.createElement('ul')
        },
        li: {
          selector: '.student-item',
        },
        data: [],
      },
      search: {
        header: {
          selector: '.page-header',
          domElement: document.createElement('div')
        },
        div: {
          selector: '.student-search',
          domElement: document.createElement('div')
        },
        input: {
          placeholder: 'Search for students...',
          domElement: document.createElement('input')
        },
        button: {
          text: 'Search',
          domElement: document.createElement('button')
        }
      }
    }



    //- loadStudentsData() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- When the object initiates load students from "THE DOM" into the data proporty 
    //----- Intended to only be run on initiatiation
    var loadFeedData = function () {
      SearchFilter.feed.ul.domElement = document.querySelector( SearchFilter.feed.ul.selector ); // Load Feed UL tag fro mthe DOM
      SearchFilter.search.header.domElement = document.querySelector( SearchFilter.search.header.selector );  // Load Header Div tag from the DOM
      SearchFilter.feed.data = [].slice.call( document.querySelectorAll( SearchFilter.feed.li.selector ) );  // Load All Students from the DOM
    }

    loadFeedData();


    //- removeActivePage() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Remove active class on current pagination widget
    var removeActivePage = function () {
      var obj_current_active = document.querySelectorAll('.active');
      for(var i=0, len2=obj_current_active.length; i < len2; i++){
        obj_current_active[i].classList.remove('active');
      }
    }


    //- newSearch() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Function for changing data in the feed to match searched
    var newSearch = function () {
      
      removeActivePage(); // Remove active page 
      
      // Filter search the array of DOM elements to find a match
      ary_results = SearchFilter.feed.data.filter(function (domElement, index) {

        var value = domElement.querySelector('h3').innerHTML;
        var searchterm = SearchFilter.search.input.domElement.value;
        
        if(searchterm.length === 0) {
          return false;
        }

        // if search is blank
        if( value.indexOf(searchterm) == 0) {
          return domElement;
        } 

      });

      // clear the current feed
      SearchFilter.feed.ul.domElement.innerHTML = '';
            
      if(ary_results.length === 0){
        SearchFilter.feed.ul.domElement.innerHTML = '<li><div class="student-details"><h3>Sorry No Results Found</h3></div></li>'; // no results found 
        return;
      }

      // For loop the ary_results and add to the feed UL to render the new search results
      for(var i=0, len=ary_results.length; i < len; i++){
        SearchFilter.feed.ul.domElement.appendChild( ary_results[i] ); // add dom element to UL tag
      }

    }


    //- renderSearchFilter() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Renders the search module on the page
    var renderSearchFilter = function () {

      SearchFilter.search.input.domElement.setAttribute('placeholder', SearchFilter.search.input.placeholder ); // set placeholder attribute on input
      SearchFilter.search.button.domElement.innerHTML = SearchFilter.search.button.text; // set inner html on button 

      SearchFilter.search.button.domElement.addEventListener("click", newSearch, false); // Add click event for the button

      SearchFilter.search.div.domElement.classList.add( SearchFilter.search.div.selector.substr(1) );  // add class to div wrapper 
      SearchFilter.search.div.domElement.appendChild(SearchFilter.search.input.domElement);  // add input to div wrapper
      SearchFilter.search.div.domElement.appendChild(SearchFilter.search.button.domElement);  // add button to div wrapper
      SearchFilter.search.header.domElement.appendChild( SearchFilter.search.div.domElement );  // add div wrapper to the DOM after the H2

    }

    renderSearchFilter();


  }


  var obj_students_search = searchfilterGenerator();




  // PAGNIATION ====================================================================================
  //-- DESCRIPTION: Adds pagination to the feed results in the DOM
    
  //-- NOTES: Spent about several hours on this one...  
  //---- Over time I think I could rewrite the code agian to be easier to read. 
  //---- I wrote this so over time properties can be pased in on instatiation

  //-- PROPERTIES:
  
  //---- properties (object) : stores data reguarding the current state of pagination
  //-------- page_limit (int) : treehouse page limit project requirment
  //-------- displayed (int) : items to display
  //------------ selector (string) : the string that stores the feed classname selector
  //------------ domElement (object) : the domElement that stores the feed ul element
  //-------- pages (int) : total pages. Set to 0 on init becuase the data has not been loaded
  //------------ selector (string) : the string that stores the feed li classname selector
  //-------- current (int) : current page
  
  //---- feed (object) : stores data reguarding the feed of data 
  //-------- ul (object) : the object that store the feed ul selector and DOM object for later reference
  //------------ selector (string) : the string that stores the feed classname selector
  //------------ domElement (object) : the domElement that stores the feed ul element
  //-------- li (object) : the object that store information about the feed li elements 
  //------------ selector (string) : the string that stores the feed li classname selector
  //-------- data (array) : the data pulled from the dom

  //---- pagination (object) : stores data reguarding the pagination module 
  //-------- active (object) : store the active page element and active css selector
  //------------ selector (string) : active css selector
  //------------ domElement (object) : current active dom element
  //-------- div (object) : the object that store information about the pagination div wrapper 
  //------------ selector (string) : the string that stores the pagination div classname selector
  //------------ domElement (object) : current div wrapper dom element
  //-------- ul (array) : the object that store information about the pagination ul list 
  //------------ domElement (object) : current ul wrapper dom element

  //-- PRIVATE METHODS:
  //----- loadFeedData() : loads elements on the dom and the data from the feed and check for bookmarks in the url
  //----- renderFeed() : render the current feed data on the page
  //----- removeActivePage() : removes active state from pages after search button has been clicked
  //----- newPage() : function get binded to each pagination button. once clicked changes the feed data and state of the pagination buttons
  //----- renderPagination() : add the pagination widget to the page



  var paginationGenerator = function() {

    // SET PROPERTIES (PRIVATE) ___________________________________________________________________________________________________
    var Pagination = {

      // Pagination_Obj.properties (PRIVATE) : GLOBAL PROPERTIES OBJECT FOR MANAGING CURRENT PAGINATION STATE ---------------------
      properties: {
        //page_limit: 5,
        displayed: 10,
        pages: 0,
        current: 0
      },

      // Pagination_Obj.feed (PRIVATE) : PAGINATION FEED PROPERTY OBJECT FOR PRINTING RESULTS -------------------------------------
      feed: {
        ul: {
          selector: '.student-list',
          domElement: document.createElement('ul')
        },
        li: {
          selector: '.student-item',
        },
        data: [],
      },

      // Pagination_Obj.pagination (PRIVATE) : PAGINATION PROPERTY OBJECT FOR PAGING THE RESULTS ----------------------------------
      pagination: {
        active: {
          selector: '.active',
          domElement: {}
        },
        div: {
          selector: '.pagination',
          domElement: document.createElement('div')
        },
        ul: { 
          domElement: document.createElement('ul')
        }
      }

    }




    // METHODS (PRIVATE) ________________________________________________________________________________________________________

    //- loadStudentsData() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- When the object initiates load students from "THE DOM" into the data proporty 
    //----- Check for URL bookmark and load data based on current bookmark in the URL
    //----- Intended to only be run on initiatiation
    var loadFeedData = function () {
  
      Pagination.feed.data = [].slice.call( document.querySelectorAll( Pagination.feed.li.selector ) );                 // Get students from the DOM. I use the "call" to convert to array verse node a object

      //Pagination.properties.displayed = Math.ceil(Pagination.feed.data.length / Pagination.properties.page_limit);      // Ensuring results are 5 pages long

      Pagination.properties.pages     = Math.ceil( Pagination.feed.data.length / Pagination.properties.displayed );     // Equation to set number of total pages based on ata loaded
      Pagination.feed.ul.domElement   = document.querySelector( Pagination.feed.ul.selector );                          // Equation to set number of total pages based on ata loaded
  
      if(window.location.hash.length > 1) {
        Pagination.properties.current = (window.location.hash[1] - 1);
      }  

    }

    loadFeedData();



    //- renderFeed() : (PRIVATE) ----------------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Renders the feed on inside the UL list on the page based pn the "page" argument 
    //----- Still deciding if should be public or private

    var renderFeed = function (page) {

      // if page number not passed defualt to page 0 
      if(typeof(page) === "undefined") {
        page = 0;
      }

      var int_feed_begin = page * Pagination.properties.displayed; // Equation to get start index
      var int_feed_end = ( int_feed_begin + Pagination.properties.displayed );              // Equation to get end index
      
      var ary_current_page_data = Pagination.feed.data.slice( int_feed_begin, int_feed_end );   // Set splicded array chunk to current_recordset

      Pagination.feed.ul.domElement.innerHTML = '';   // Clear feed UL element of older data

      // For loop the spliced "ary_Current_Page_Data" and add to the feed UL to render the new paged results
      for(var i=0, len=ary_current_page_data.length; i < len; i++){
        Pagination.feed.ul.domElement.appendChild( ary_current_page_data[i] ); 
      }
  
    }
  
    renderFeed( Pagination.properties.current );



    //- removeActivePage() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Remove active class on current pagination widget
    var removeActivePage = function () {
      var obj_current_active = Pagination.pagination.div.domElement.querySelectorAll('.active');
      for(var i=0, len2=obj_current_active.length; i < len2; i++){
        obj_current_active[i].classList.remove('active');
      }

      var obj_input = document.querySelector('input');
      obj_input.value = '';
    }



    //- newPage() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Function for changing to a new page and loading new data
    var newPage = function (page) {
      removeActivePage(); // Remove active
      this.classList.add('active');         // Add active to current clicked item
      renderFeed( (this.innerHTML - 1) );   // Render current data
    }



    //- renderPagination() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Renders the pagination module on the "page"  
    var renderPagination = function (page) {

      // if page number not passed defualt to page 0
      if(typeof(page) === "undefined") {
        page = 0;
      }

      // Add class to pagination wrapper div
      Pagination.pagination.div.domElement.classList.add( Pagination.pagination.div.selector.substr(1) ); 

      // Create temp obj variable to build pagination list elements
      var obj_pageination_li;
      var obj_pageination_a;

      // Loop page segments based on the data loaded
      for(var i=0, len=Pagination.properties.pages; i < len; i++) {

        obj_pageination_li = document.createElement('li');  // Create li for each page
        obj_pageination_a = document.createElement('a');    // Create a for each page
        obj_pageination_a.innerHTML = (i+1);                // Add page number == index number - 1
        obj_pageination_a.setAttribute('href', '#'+(i+1));  // Add page number bookmark to href

        // Check if current page = i to set active state 
        if(page === i) {
          obj_pageination_a.classList.add('active');  // Add class active 
        }

        obj_pageination_a.addEventListener("click", newPage, false);                       // Bind page change function to click event
        obj_pageination_li.appendChild(obj_pageination_a);                                 // Append A tag to UL
        Pagination.pagination.ul.domElement.appendChild(obj_pageination_li);               // Append LI tag to UL

      }

      Pagination.pagination.div.domElement.appendChild(Pagination.pagination.ul.domElement);          // Add ul pagination list to the pagination div 
      Pagination.feed.ul.domElement.parentNode.appendChild( Pagination.pagination.div.domElement );   // Add pagination widget to the DOM

    }

    renderPagination(Pagination.properties.current);


  }

  var obj_students = paginationGenerator();

*/

});
