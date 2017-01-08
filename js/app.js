

// QUOTES ====================================================================================
//-- DESCRIPTION: UNOBTRUSSIVE NON JQUERY PAGINATION BASED ON PRELOADED DOM ELEMENTS

//-- NOTES: 
//---- 1) For improved code clarity... I think I am going to start noting private properties as "[Obj name]_[Type]_[PropertyName]"
//---- 2) At this point not sure why I need public properties as changing them outside the object seems to introduce risk of issues...
//---- 3) I am missing jquery or mootools right about now....

document.addEventListener("DOMContentLoaded", function(event) {


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
        domElements: [],
        h2Elements: []
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
    //----- Check for URL bookmark and load data based on current bookmark in the URL
    //----- Intended to only be run on initiatiation
    var loadFeedData = function () {
      SearchFilter.feed.ul.domElement = document.querySelector( SearchFilter.feed.ul.selector );
      SearchFilter.search.header.domElement = document.querySelector( SearchFilter.search.header.selector ); 
      SearchFilter.feed.domElements = [].slice.call( document.querySelectorAll( SearchFilter.feed.li.selector ) );
      SearchFilter.feed.h2Elements = [].slice.call( document.querySelectorAll('h3') );
      
      for(var i=0, len=SearchFilter.feed.h2Elements.length; i < len; i++) {
        SearchFilter.feed.data.push(SearchFilter.feed.h2Elements[i].innerHTML);
      }
      
      console.log(SearchFilter);
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


    //- newPage() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Function for changing to a new page and loading new data
    var newSearch = function () {
      removeActivePage();
      
      ary_results = SearchFilter.feed.domElements.filter(function (domElement, index) {

        var value = domElement.querySelector('h3').innerHTML;
        var searchterm = SearchFilter.search.input.domElement.value;

        if( value.indexOf(searchterm) > -1) {
          return domElement;
        } 

      });

      SearchFilter.feed.ul.domElement.innerHTML = '';

      // For loop the spliced "ary_Current_Page_Data" and add to the feed UL to render the new paged results
      for(var i=0, len=ary_results.length; i < len; i++){
        console.log(ary_results[i]);
        SearchFilter.feed.ul.domElement.appendChild( ary_results[i] ); 
      }

    }


    //- renderSearchFilter() : (PRIVATE) -----------------------------------------------------------
    //-- DESCRIPTION:    
    //----- Renders the pagination module on the "page"  
    var renderSearchFilter = function () {

      SearchFilter.search.input.domElement.setAttribute('placeholder', SearchFilter.search.input.placeholder );
      SearchFilter.search.button.domElement.innerHTML = SearchFilter.search.button.text;

      SearchFilter.search.button.domElement.addEventListener("click", newSearch, false);

      SearchFilter.search.div.domElement.classList.add( SearchFilter.search.div.selector.substr(1) ); 
      SearchFilter.search.div.domElement.appendChild(SearchFilter.search.input.domElement);
      SearchFilter.search.div.domElement.appendChild(SearchFilter.search.button.domElement);
      SearchFilter.search.header.domElement.appendChild( SearchFilter.search.div.domElement );

    }

    renderSearchFilter();



  }


  var obj_students_search = searchfilterGenerator();


  var paginationGenerator = function() {



    // SET PROPERTIES (PRIVATE) ___________________________________________________________________________________________________
    var Pagination = {

      // Pagination_Obj.properties (PRIVATE) : GLOBAL PROPERTIES OBJECT FOR MANAGING CURRENT PAGINATION STATE ---------------------
      properties: {
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
  
      Pagination.feed.data = [].slice.call( document.querySelectorAll( Pagination.feed.li.selector ) );               // Get students from the DOM. I use the "call" to convert to array verse node a object
      Pagination.properties.pages = Math.ceil( Pagination.feed.data.length / Pagination.properties.displayed );   // Equation to set number of total pages based on ata loaded
      Pagination.feed.ul.domElement = document.querySelector( Pagination.feed.ul.selector );                          // Equation to set number of total pages based on ata loaded
  
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
      var int_feed_end = ( int_feed_begin + Pagination.properties.displayed ) - 1;              // Equation to get end index

      var ary_current_page_data = Pagination.feed.data.slice( int_feed_begin, int_feed_end );   // Set splicded array chunk to current_recordset

      Pagination.feed.ul.domElement.innerHTML = '';                                                // Clear feed UL element of older data

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



});
