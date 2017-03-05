

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
      segment: {
        page:  1,
        current : 0,
        begin : 0,
        end : exports.displayed
      },
      search: {
        domElement: document.querySelector( exports.search_header ),
        isSearched: false,
        term: '',
      },
      feed: document.querySelector( exports.feed_UL ),
      paging: document.createElement('div'),
    }




    // UTILITY METHODS =======================================================================================================


    // GET URL PARAMETER BY NAME (PRIVATE) -------------------------------------------------------------------
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


    // UPDATE URL PARAMETER NAME (PRIVATE) -------------------------------------------------------------------
    _.updateParameter = function(querystring) {

      if(_.debug === true) { console.group('Runing _.updateParameter()'); }

      if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?'+ querystring;
        if(_.debug === true) { console.log('newurl: '+ newurl); }
        window.history.pushState({path:newurl},'',newurl);
      }

      if(_.debug === true) { console.groupEnd(); }

    }




    // SET & GET METHODS =======================================================================================================


    // SET CURRENT DATA ARRAY (PRIVATE) ---------------------------------------------------------------
    _.setCurrentData = function (dataArray) {

      if(_.debug === true) { 
        console.group('Runing _.setCurrentData()');
        console.log('dataArray: ');
        console.log(dataArray); 
        console.log('_.pages: '+Math.ceil( dataArray.length / exports.displayed ));
        console.groupEnd(); 
      }

      _.pages = Math.ceil( dataArray.length / exports.displayed );

      if(_.segment.page > _.pages) {
        _.setSegment(_.pages); 
        window.location.hash = _.pages;
      }

      _.data.current = dataArray;

    }


    // SET CURRENT SEGMENT (PRIVATE) ---------------------------------------------------------------
    _.setSegment = function (page) {
      
      if(_.debug === true) { console.group('Runing _.setSegment()'); }

      _.segment.page = page;
      _.segment.current = (page - 1);
      _.segment.begin = _.segment.current * exports.displayed;
      _.segment.end = (_.segment.current * exports.displayed) + exports.displayed;

      if(_.debug === true) { 
        console.log(' _.segment: ');
        console.log( _.segment );
        console.groupEnd(); 
      }

    }


    // GET DATA FROM THE OBJECT (PRIVATE) ------------------------------------------------------
    _.getDataSegment = function() {

      if(_.debug === true) { 
        console.group('Runing _.getDataSegment('+_.segment.begin+','+_.segment.end+')');
        console.log('_.segment: '); 
        console.log(_.segment); 
        console.groupEnd(); 
      }

      return _.data.current.slice( _.segment.begin, _.segment.end );

    }




    // CLEAR METHODS =======================================================================================================

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




    // RENDER METHODS =======================================================================================================

    // RENDER PAGINATION (PRIVATE) ------------------------------------------------------
    _.renderPagination = function (total) {
      
      if(_.debug === true) { console.group('Runing _.renderPagination()'); }

      // Create temp obj variable to build pagination list elements
      var obj_ul = document.createElement('ul');                            // Define UL Element - More for Clarity
      var obj_li = document.createElement('li');                            // Define Li Element - More for Clarity
      var obj_a  = document.createElement('a');                             // Define A Element  - More for Clarity

      if(_.debug === true) { 

        console.group('Local Variables'); 

        console.log('total: '+ total); 
        console.log('_.pages: '+ _.pages); 

        console.log('_.segment'); 
        console.log(_.segment);

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

        if(_.segment.current === i) {
          obj_a.classList.add('active');                         // Add class active
        }

        obj_a.addEventListener("click", function(){

            if(_.debug === true) { 
              console.group('Runing Click New Page '+this.innerHTML+''); 
            }

            _.setSegment(this.innerHTML);
            _.clearFeed();
            _.renderFeed(_.getDataSegment());

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
    _.renderFeed = function (pagedData) {

      if(_.debug === true) { 
        console.group('Runing _.renderFeed('+_.segment.current+')');
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
        console.log('current: '+_.segment.current);
      }
      
      // Reset pages
      _.renderPagination(_.pages);

      if(_.debug === true) { 
        console.groupEnd();
      }

    }


    // SEARCH DATA FROM THE OBJECT (PUBLIC) ----------------------------------------------------------------------
    _.searchData = function() {

      if(_.debug === true) { console.group('Runing _.searchData()'); }

      window.location.hash = '';
      
      _.clearFeed();

      _.setSegment(1);

      var str_term = _.search.domElement.querySelector('input').value;
      
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
        if(value.indexOf(str_term) > -1) {

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

      console.log(ary_results);

      if(ary_results.length === 0){
        _.feed.innerHTML = '<li><div class="'+_.feed.selector+'"><h3>Sorry No Results Found</h3></div></li>'; // no results found 
        return;
      }

      if(_.debug === true) { 
        console.groupEnd(); 
      }

      _.setCurrentData(ary_results); 
      _.renderFeed(_.getDataSegment(0, exports.displayed));

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

      var hashPageNumber = Number(window.location.hash.substr(1, window.location.hash.length));
      var search = ''
      var loadedPageNumber = 1;

      if(hashPageNumber) {
        loadedPageNumber = Number(hashPageNumber);
      }
      
      _.setSegment(loadedPageNumber);
      _.clearFeed();
      _.renderSearch();
      _.setCurrentData(_.data.loaded);
      _.renderFeed( _.getDataSegment() );

      if(_.debug === true) { console.groupEnd(); }

    }());



    return exports;



  }( obj_Feed || {} ));

  //var obj_students = paginationGenerator();

});


