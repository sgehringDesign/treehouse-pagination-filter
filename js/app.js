

// SEARCH FILTER & PAGINATION ====================================================================================
//-- DESCRIPTION: UNOBTRUSSIVE NON JQUERY PAGINATION BASED ON PRELOADED DOM ELEMENTS

//-- NOTES: 
//---- 1) For improved code clarity... I think I am going to start noting private properties as "[Obj name]_[Type]_[PropertyName]"
//---- 2) At this point not sure why I need public properties as changing them outside the object seems to introduce risk of issues...
//---- 3) I am missing jquery or mootools right about now....



document.addEventListener("DOMContentLoaded", function(event) {



  // FEED OBJECT ============================================================================================================================================
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

  var obj_Feed = (function(exports) {
    'use strict';


    // PROPERTIES (PUBLIC) ___________________________________________________________________________________________________
    var exports = {
      feed_UL: '.student-list',
      feed_LI: '.student-item',
      search_header: '.page-header',
      pagination: '.pagination',
      displayed: 10,
    }


     // PROPERTIES (PRIVATE) ___________________________________________________________________________________________________
    var _ = {
      debug: true,
      data: {
        loaded: [].slice.call( document.querySelectorAll( exports.feed_LI ) ),
        current: [],
        searched: [],
      },
      pages: 0,
      segment:  0,
      page:  0,
      search: {
        domElement: document.querySelector( exports.search_header ),
        isSearched: false,
        term: '',
      },
      feed: document.querySelector( exports.feed_UL ),
      paging: document.createElement('div'),
    }


    // UTILITY METHODS =======================================================================================================


    // GET PARAMETER BY NAME (PRIVATE) -------------------------------------------------------------------
    _.getParameterByName = function(name) {

      var url = window.location.href;      
      var name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
      var results = regex.exec(url);

      if(_.debug === true) { 
        console.group('Runing _.getParameterByName()');
        console.log('url: '+ url); 
        console.log('name: '+ name); 
        console.log('regex: '+ regex); 
        console.log('results: '+ results); 
        console.log(decodeURIComponent(results[2].replace(/\+/g, " ")));
        console.groupEnd();
      }

      if (!results) { return null; }
      if (!results[2]) { return ''; }
      return decodeURIComponent(results[2].replace(/\+/g, " "));

    } 


    // UPDATE PARAMETER NAME (PRIVATE) -------------------------------------------------------------------
    _.updateParameter = function(querystring) {

      if(_.debug === true) { console.group('Runing _.updateParameter()'); }

      if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?'+ querystring;

        if(_.debug === true) { 
          console.log('newurl: '+ newurl); 
        }

        window.history.pushState({path:newurl},'',newurl);
      }

      if(_.debug === true) { console.groupEnd(); }

    }


    // SET CURRENT DATA ARRAY (PRIVATE) ---------------------------------------------------------------
    _.setCurrentData = function (dataArray) {

      if(_.debug === true) { 
        console.group('Runing _.setCurrentData()');
        console.log(dataArray); 
        console.groupEnd(); 
      }

      _.data.current = dataArray;
      _.pages = Math.ceil( dataArray.length / exports.displayed );
    }


    // CLEAR PAGINATION (PRIVATE) ---------------------------------------------------------------
    _.clearPagination = function () {
      var pagination = document.getElementsByClassName(exports.pagination.substr(1));

      if(_.debug === true) { 
        console.group('Runing _.clearPagination()');
        console.log(pagination);
      }

      if(pagination.length > 0) {
        pagination[0].innerHTML = '';
      }

      if(_.debug === true) { console.groupEnd(); }
    }


    // CLEAR FEED (PRIVATE) -------------------------------------------------------------------
    _.clearFeed = function () {

      _.feed.innerHTML = ''; // clear ul list element
      var obj_paging_active = _.paging.querySelectorAll('.active');  // get all active elements 

      if(_.debug === true) { 
        console.group('Runing _.clearFeed()');
        console.group('Loop obj_paging_active');
        console.log(obj_paging_active); 
      }

      for(var i=0, len=obj_paging_active.length; i < len; i++){
        obj_paging_active[i].classList.remove('active');  // remove all active elements 
        if(_.debug === true) { 
          console.log('obj_paging_active['+i+']: ');
          console.log(obj_paging_active[i]);
        }
      }
      if(_.debug === true) { 
        console.groupEnd(); 
      }

      _.clearPagination();

      if(_.debug === true) { 
        console.groupEnd(); 
      }

    }


    // GET DATA FROM THE OBJECT (PRIVATE) ------------------------------------------------------
    _.getDataSegment = function(int_begin, int_end ) {

      if(_.debug === true) { 
        console.group('Runing _.getDataSegment('+int_begin+','+int_end+')');
        console.log('int_begin: '+ int_begin); 
        console.log('int_end: '+ int_end); 
        console.log('_.pages: '+ _.pages); 
        console.groupEnd(); 
      }

      //Type check for int_begin
      if(!(int_begin === parseInt(int_begin, 10))) {
        console.error( 'obj_Feed.getDataSegment() : Bad type passed for "int_begin". This needs to be a int');
        return false;
      }

       //Type check for int_end
      if(!(int_end === parseInt(int_end, 10))) {
        console.error( 'obj_Feed.getDataSegment() : Bad type passed for "int_end". This needs to be a int');
        return false;
      }

      // Check for int_begin is less then zero or out of range
      if(_.data.current.length < int_begin || 0 > int_begin) {
        console.warn( 'obj_Feed.getDataItem() : Passed "int_begin" value is out of range of the loaded data array');
        return false;
      }

      return _.data.current.slice( int_begin, int_end );

    }


    // RENDER PAGINATION (PRIVATE) ------------------------------------------------------
    _.renderPagination = function (total, current) {
      
      if(_.debug === true) { console.group('Runing _.renderPagination()'); }

      // Create temp obj variable to build pagination list elements
      var obj_ul = document.createElement('ul');                            // Define UL Element - More for Clarity
      var obj_li = document.createElement('li');                            // Define Li Element - More for Clarity
      var obj_a  = document.createElement('a');                             // Define A Element  - More for Clarity

      if(_.debug === true) { 
        console.group('Local Variables'); 
        console.log('total: '+ total); 
        console.log('current: '+ current); 
        console.log('_.pages: '+ _.pages); 
        console.log('exports.pagination.substr(1): '+ exports.pagination.substr(1)); 
        console.groupEnd();
      }

      // Add class to pagination wrapper DIV
      _.paging.classList.add( exports.pagination.substr(1) );     // Add Class

      if(_.debug === true) { 
        console.group('Loop Page Buttons');
      }
      
      for(var i=0, len=_.pages; i < len; i++) {

        obj_li = document.createElement('li');                   // Reset Li Element
        obj_a  = document.createElement('a');                    // Reset A Element
        obj_a.innerHTML = (i+1);                                 // Add innerHTML
        obj_a.setAttribute('href', '#'+(i+1));                   // Add HREF attribute

        if(current === i) {
          obj_a.classList.add('active');                         // Add class active
        }

        obj_a.addEventListener("click", function(){
            
            if(_.debug === true) { 
              console.group('Runing Click New Page '+this.innerHTML+''); 
            }
            
            _.page = this.innerHTML;
            _.segment = (this.innerHTML - 1);

            if(_.debug === true) { 
              console.log('_.page: ' + _.page);
              console.log('_.segment: ' + _.segment); 
              console.log('(_.segment * exports.displayed) ' + (_.segment * exports.displayed));
              console.log('(_.segment * exports.displayed) + exports.displayed ) ' + ((_.segment * exports.displayed) + exports.displayed) ); 
            }
            
            _.clearFeed();
            _.renderFeed(_.getDataSegment( (_.segment * exports.displayed), (_.segment * exports.displayed) + exports.displayed ), _.data.current.length, _.segment);

            if(_.debug === true) { console.groupEnd(); }

        }, false);

        obj_li.appendChild(obj_a);                               // Append A tag to UL
        obj_ul.appendChild(obj_li);                              // Append LI tag to UL

        if(_.debug === true) { 
          console.group('Page Button: '+i+' DOM Objects '); 
          console.log('obj_ul:'); 
          console.log(obj_ul); 
          console.log('obj_li:'); 
          console.log(obj_li); 
          console.log('obj_a:'); 
          console.log(obj_a); 
          console.groupEnd();
        }

      }

      _.paging.appendChild(obj_ul);                              // Add UL pagination list to the pagination div 
      _.feed.parentNode.appendChild( _.paging );                 // Add pagination widget to the DOM

      if(_.debug === true) { 
        console.groupEnd();
        console.group('Rendered DOM Objects'); 
        console.log('_.paging:'); 
        console.log(_.paging); 
        console.log('_.feed.parentNode:'); 
        console.log(_.feed.parentNode);
        console.groupEnd(); 
        console.groupEnd();
      }

    }


    // RENDER FEED (PRIVATE) ------------------------------------------------------
    _.renderFeed = function (pagedData, total, current) {

      if(_.debug === true) { 
        console.group('Runing _.renderFeed('+current+')');
        console.group('Loop pagedData:'); 
        console.log(pagedData);
      }

      // For loop the spliced "ary_Current_Page_Data" and add to the feed UL to render the new paged results
      for(var i=0, len=pagedData.length; i < len; i++){

        if(_.debug === true) { 
          console.log('pagedData['+i+']:'); 
          console.log(pagedData[i]); 
        }

        _.feed.appendChild( pagedData[i] ); // add DOM object into UL feed

      }

      if(_.debug === true) { 
        console.groupEnd(); 
        console.log('pagedData.length: '+pagedData.length);
        console.log('current: '+current);
      }
      
      // Reset pages
      _.renderPagination(total, current);

      if(_.debug === true) { 
        console.groupEnd();
      }

    }













    // SEARCH DATA FROM THE OBJECT (PUBLIC) ----------------------------------------------------------------------
    _.searchData = function() {

      if(_.debug === true) { console.group('Runing _.searchData()'); }

      _.clearFeed();

      var str_term = _.search.domElement.querySelector( 'input' ).value;
      
      if(_.debug === true) { 
        console.log('str_term: ' + str_term); 
      }
      
      if(_.debug === true) { 
        console.group('Filter Items');
      }
      
      // Filter search the array of DOM elements to find a match
      var ary_results = _.data.loaded.filter( function (domElement, index) {

        var value = domElement.querySelector('h3').innerHTML;  // get inner string to be searched in dom element

        // Search term index of to check form match
        // value.slice(0, str_term.length) === str_term 
        if(value.slice(0, str_term.length) === str_term) {
          if(_.debug === true) { 
            console.group('Filter Item _.data.loaded ' + index + ' + ');
            console.log('value: ' + value);
            console.log('value.slice(0, ' + str_term.length +'): ' + value.slice(0, str_term.length)); 
            console.log('str_term: ' + str_term);
            console.log('str_term.length: ' + str_term.length);
            console.groupEnd(); 
          }
          return domElement; // return element to array
        }

        if(_.debug === true) { 
          console.group('Filter Item _.data.loaded ' + index + ' - ');
          console.log('value: ' + value);
          console.log('value.slice(0, ' + str_term.length +'): ' + value.slice(0, str_term.length)); 
          console.log('str_term: ' + str_term);
          console.log('str_term.length: ' + str_term.length);
          console.groupEnd(); 
        }

      });
      
      if(_.debug === true) { 
        console.groupEnd(); 
      }
      _.data.searched = ary_results; // set searched results to stored property
      _.updateParameter('s='+str_term);  // update qstring in url history
      _.data.searched.isSearched = true; // set searched property to true

      if(_.debug === true) { 
        console.group('Results');
        console.log(ary_results); 
        console.log(_.data.searched.isSearched); 
        console.groupEnd(); 
      }

      if(ary_results.length === 0){
        //_.feed.domElement.innerHTML = '<li><div class="'+_.feed.selector+'"><h3>Sorry No Results Found</h3></div></li>'; // no results found 
        return;
      }

      if(_.debug === true) { 
        console.groupEnd(); 
      }

      _.setCurrentData(ary_results);
      _.renderFeed(_.getDataSegment(0, exports.displayed), _.data.current.length, 0);

    }



    _.renderSearch = function () {

      if(_.debug === true) { console.group('Runing _.renderSearch()'); }

      var obj_div = document.createElement('div');
      var obj_input = document.createElement('input');
      var obj_button = document.createElement('button');

      obj_div.classList.add('student-search');
      obj_input.setAttribute('placeholder', 'Search for students...' );

      if(_.search.isSearched) {
        obj_input.value = _.search.term;
      }

      obj_button.innerHTML = 'Search';
      obj_button.addEventListener("click", _.searchData, false); 

      obj_div.appendChild(obj_input);
      obj_div.appendChild(obj_button);

      _.search.domElement.appendChild( obj_div );
      
      if(_.debug === true) { 
          console.group('Search DOM Objects'); 
          console.log('obj_div:'); 
          console.log(obj_div); 
          console.log('obj_input:'); 
          console.log(obj_input); 
          console.log('obj_button:'); 
          console.log(obj_button); 
          console.log('_.search.domElement:'); 
          console.log(_.search.domElement); 
          console.groupEnd();
          console.groupEnd();
        }

    }


    !(function() {
      if(_.debug === true) { console.group('Runing Init !(function())'); }
      
      _.clearFeed();
      _.renderSearch();
      _.setCurrentData(_.data.loaded);
      _.renderFeed( _.getDataSegment(0, exports.displayed), _.data.current.length, 0);

      if(_.debug === true) { console.groupEnd(); }
    }());


    return exports;


  }( obj_Feed || {} ));

  //var obj_students = paginationGenerator();

});












































 /*
  var obj_Feed = (function(exports) {
    'use strict';


  
    // METHODS (PUBLIC) ________________________________________________________________________________________________________
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

  }
*/



/*
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
*/
