/*
Groupings to try:
- Computers/Hardware (make base IT: IC, 4004 diff?)
- Software Projects
- Games (subset of software)
- Writing (books, papers, magazines)
	- Play Studies
	- Computers & Media
	.. and then they merge (Digra)
- Community Meeting (Working, conf.)
- War
- Institutions (all as one category, or per MIT, Apple, etc...)

I just need to try:
- adding colors (easy) (colourlover!)
- changing dot sizes (easy)
- ...then try making some lines

For lines, first try dropping in some spans for date ranges we have.
	(maybe put text in the center of it, or towards the start.)
	
	
#1: Put hardware platforms on the left hand side.
	(could be subdivided into consumer/institutional)
#2: Break institutional arrangements on the right (and software in the middle); commentary goes in its own column.
#3: Spines/Rules/Alignes (dotted lines going up we can snap things to); or make them fat columns.

# .. ideas in there own column (books, papers) unless directly hardware related

We could color pre-digital computers with: mechanical, electro-m, vacuum, binary, analog, (then) transistor. (these could even be sub-columns of a particular column, with EDVAC report on the boundary). This could be the hardware column. 4004 (as 1st chip), timeshare, could also be in here. So we'd get a diagonal, from lower left up to top right, from Mark 1 to 4004. (which could then simply become about transistor density/cost); or penetration to beings on Earth (cell phone as proxy), or # of chips in existence.

Also need to find horizontal rules that can divide history in epochs;
eg, this event is a proxy for a particular transformation.
	WWW
	Intel 4004
	EDVAC report (could paint background to next milestone a color; color could be shared by Z3&Z4, and any Turing writing, too). epoch:X epoch-start:X
	First time sharing
	First minicomputer (PDP-1?, or TX-?)

What if we coudl query the timeline, and it rearranges, focusing on a line we care about?
- show/hide funding
- pick an end product/point (as query), and it highlights history of that, and offshoots.
- itunes like incremental free text search on all fields of all events (dim out those that don't match).

Important relationships: (kinds of edges)
- lines of computers (platform as a line; systems evolution)
- products from a company (company as line)
- lines of people (same people across projects)
- influences (ideas traversing nodes; eg papert/kay, pdp- to microprocessor architecture ideas)
- funding (govt program to projects; VCs)
- spinoffs (people moving from, eg fairchild to intel)
- projects on a platform (eg games to systems; to tech type, IC; computers to chips)
*/

//var mousePos ;
//var cursor = new Path.Circle( new Point(10,10), 15 ) ;
//cursor.fillColor = 'black';

/*
Interesting tags for games:
- text v. graphics
- real time
- n players
- ai counterpart
- as game metaphor mostly (game of life, eg)
- commercial/university/military/folk
- stand-alone (eg arcade)/boxed software (hardware v software)
- dist. as box, source, or replicated

Tags for computers:
- digital
- mechanical/(electronic: vacuum/transistor/chip)
- stored program
- commercial/research/military

TODO:
- show what has fallen off the bottom; perhaps with inserted random lines per item, or dated items in a list with dates.
- fix elements falling off rhs. maybe with divs + svg?
*/


/*
 *    Includes
 */

require('js-yaml');



	/*
	 *	Constants
	 */

var yearStart = 1925 ;
var yearEnd   = 2015 ;

var yearToPxScale  = 17 ; //20 ; //17 ;
var yearToPxStart  = 30 ;
var yearMajorLine = 10 ;
var yearMinorLine = 1 ;

var itemHorizGutter = 60 ;
var itemFirstX      = 75 ;

var dataFileName= "data.csv";

// orient time
var isTimeForwardUp = true ;

var colors =
	[ '9F6B8F', '8FC1B3', 'F4EE86', 'F7D464', 'FE424E' ] ;
	// bright 1
	
//console.log(colors) ;

var eventTagX =
{
	'game'			: 600,
	'play'			: 600,
	'software'		: 600,
	'language'		: 600,
	'computer'		: 350,
	'academic-text' : 800,
	'popular-text'  : 800,
	'exhibit'		: 800,
	'chip'			: 800,
	'film'			: 820
//	'politics'		: 0
} ;

var eventTagF =
{
	'MIT'			: colorDotF('red'),
	'game'			: colorDotF('blue'),
	'play'			: colorDotF('CCACE0'),
	'computer'		: colorDotF('green'),
	'academic-text' : colorDotF('orange'),
	'popular-text'  : colorDotF('yellow'),
	'film'			: colorDotF('orange'),
	'exhibit'		: colorDotF('yellow')		
} ;
	
/*
bright 1 http://www.colourlovers.com/palette/1144734/timeline
bright 2 http://www.colourlovers.com/palette/2528096/Precipitate_in_love%E2%9C%BF?widths=0
dark but bold http://www.colourlovers.com/palette/444399/Man_on_the_subway
subdued http://www.colourlovers.com/palette/2404814/timeline
*/




	/*
	 *	Globals
	 */

var eventsAsArray ;
var eventsAll     ;
var eventsByYear  ;

var eventViews = [] ;

var yearThickness=[yearEnd]; // array of [yearStart] ... [yearEnd] with rightmost pixel edge

var rollover ;
var selection ;

var layerYears ;
var layerEvents ;
var layerEventDetail ;
var layerLines ;



	/*
	 *	cEvent & cEventView
	 */
	 
function cEvent()
{
	this.tag	=	 {} ;
	this.title	=	 '' ;
	this.year	=	 0 ;
	this.size   =	 2 ;

	this.searchTextLowerCase =	 '' ;

	this.hasTag = function( value )
	{
		return this.hasAttr( 'tag', value ) ;
	}

	this.hasAttr = function( type, value )
	{
		return type in this.tag && (value in this.tag[type]) ;
	}
			
	this.findStringInEventLowerCase = function(string)
	{
		return this.searchTextLowerCase.indexOf(string) !== -1 ;
	}
}

function cEventView()
{
	this.text		= null ;
	this.dot		= null ;
	this.event		= null ;
	
	this.group		= null ;
}




	 /*
	  *	Main
	  */

main() ;

function main()
{
	
	// install query text entry box update
	$('#query').keyup( updateQuery ).keydown( updateQuery ) ;

	function updateQuery( keyEvent )
	{
		// hide any rollover
		showEventViewDetail(null) ;
		
		// do query
		doQuery( document.getElementsByName('query')[0].value ) ;
	}


	// initialize year thickness
	for( var i=yearStart; i<yearEnd; ++i ) yearThickness[i]=0 ;


	// setup layers
	layerYears  = new Layer() ;
	layerLines  = new Layer() ;
	layerEvents = new Layer() ;
	layerEventDetail = new Layer() ;
	

	// draw date lines
	addDateLines(layerYears) ;


	// get csv data, check for updates
	csvGet = httpGet(dataFileName) ;
	//htmlModified = httpGet("").modified ;
	//console.log(htmlModified) ;
	//console.log(location) ;


	// setup csv hotload
	var doHotloadCSV = location.host.indexOf("local") !== -1 ;
	console.log("Hotload is " + doHotloadCSV) ;

	if ( doHotloadCSV )
	{
		setInterval( function()
			{
				//console.log(csvGet.modified) ;
				
				if (    /*httpGet("").modified !== htmlModified
					 ||*/ httpGet(dataFileName)   .modified !== csvGet.modified )
				{
					//insertParam( 'query', $('#query').text() ) ;
					location.reload(true) ;
				}
				
			}, 500 ) ;
	}


	// parse csv data
	eventsAsArray = CSVToArray( csvGet.content ) ;
	eventsAll     = parseEventsFromArray(eventsAsArray) ;
	eventsByYear  = getEventsByYear(eventsAll) ;

	// sort events by year
	eventsByYear.map( function( oneYear )
	{
		oneYear.sort( sortEventsOfYear ) ;
	}) ;

	// add all events to map
	eventsByYear.map( function( oneYear )
	{
		oneYear.map( addEventToView ) ; // populate eventViews
	}) ;


	// load params from URL (eg default query specified)
	var gURLVars = getUrlVars() ;

	//console.log( gURLVars ) ;
	if ( !isUndef( gURLVars["query"] ) )
	{
		var query = gURLVars["query"] ;
		
		//console.log( query ) ;
		
		$('#query').val( query ) ; // set textbox
		
		doQuery(query) ;
	}

}


	/*
	 *	Event handlers
	 */

// interaction

function onMouseMove(event)
{
	//mousePos = event.point;

	rollover = pickEventView(event.point) ;
	
	showEventViewDetail(rollover) ;
}

function onFrame(event)
{
	//cursor.segments[0].point = mousePos ;	
}

function onResize(event) {
    // Whenever the window is resized, recenter the path:
}

function onMouseDrag(event)
{
    if ( selection )
	{
		//selection.group.position += event.delta;
	}
}

function onMouseDown(event)
{
	/*
	selection = pickEventView(event.point) ;
	
	showEventViewDetail(selection) ;
	
	if (selection)
	{
		//console.log(selection) ;
//		selection.group.guide = true ;
	}*/	
}

function onMouseUp(event)
{
	/*
	if (selection)
	{
//		selection.group.guide = false ;
		selection = null ;
	}*/
}


	/*
	 *	High level event do-ers
	 */

function doQuery( query )
{
	// do event query
	var func = filterEventByFuncFromQuery( query ) ;
	
	applyFilterToEventsView( func ) ;
	
	
	// show line thing
	if (0)
	{
		var lineEvents = [] ;
		
		if (func)
		{
			eventViews.map( function(eview)
			{
				if ( func(eview.event) )
				{
					lineEvents.push(eview) ;
				}
			}) ;
		}
		
		showEventsLine( lineEvents ) ;
	}
}


	/*
	 *	Event Detail
	 */	

function showEventsLine( eventViews )
{
	layerLines.removeChildren() ;
	
	if ( eventViews && eventViews.length>0 )
	{
		// build it
		var line = new Path() ;
		
		eventViews.map( function(eview)
		{
			line.add( eview.dot.position ) ;
		}) ;
		
		
		// style it
		line.strokeColor = new RgbColor(0,0,0,.15) ;
		line.strokeWidth = 5 ;
		
		line.smooth() ;
		
		
		// add
		layerLines.addChild(line) ;
	}
}

function showEventViewDetail( eview )
{
	// kill old one
	layerEventDetail.removeChildren() ;
	
	// make one?
	if (eview)
	{
		// text
		var text = new PointText( eview.dot.position + {x:0,y:18} ) ;
		
		text.content = eview.event.searchTextLowerCase ;
		
		
		// backing white
		var r   = 4 ; 
		var boxBounds = new Rectangle(text.bounds) ;
		boxBounds.bottom += 3 ;
		boxBounds.right += 3 ;
		boxBounds.left -= 2 ;
		boxBounds.top -= 2 ;
		var box = new Path.RoundRectangle( boxBounds, r ) ;
		
		box.fillColor   = new RgbColor(1,1,1,.95) ;
		box.strokeColor = new RgbColor(0,0,0,.5) ;
		box.strokeWidth = 1 ;


		var shadowBounds = new Rectangle(boxBounds) ;
		shadowBounds.y += 2 ;
		shadowBounds.width -= 4 ;
		var shadow = new Path.RoundRectangle( shadowBounds, r ) ;
		
		shadow.fillColor   = new RgbColor(0,0,0,.2) ;
		
		// add them
		layerEventDetail.addChild(shadow) ;
		layerEventDetail.addChild(box) ;
		layerEventDetail.addChild(text) ;
	}
}



	//
	// Utilities
	//

function isUndef (v)
{
	return typeof v === 'undefined' ;
}

function trimWhiteSpace (str) {
	if (isUndef(str)) return '' ;
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function yearToPx( year )
{
	var off ;
	
	if (isTimeForwardUp) off = yearEnd - year ;
	else				 off = (year-yearStart) ;
	
	return off * yearToPxScale + yearToPxStart ;
}



//
// Munging input data
//

function getEventsByYear( a )
{
	var byy = [] ;
	
	a.map( function(e)
	{
		var y = e.year ;
		
		if ( isUndef(byy[y]) ) byy[y] = [] ;
		
		byy[y].push(e) ;
	}) ;
	
	return byy ;
}


function parseEventsFromArray( a )
{
	var result = [] ;
	
	for( var i=0; i<a.length; ++i )
	{
		var e = parseEventFromArray(a[i]) ;
		
		if ( !isUndef(e) ) result.push(e) ;
	}
	
	return result ;
}

function parseEventFromArray( a )
{
	var e ;

	// empty? (skip blank/empty lines)
	if (    a.length==0
		 || a[0]===""	 // no date
		 || a[0][0]==="#" ) // commented out
		 return e ;
	
	// init it
	e = new cEvent() ;
	
	// grab annotations
	e.searchTextLowerCase = a[0] ;
	
	for( var i=1; i<a.length; ++i )
	{
		var colonAt = a[i].indexOf(':') ;
		
		if (colonAt==-1)
		{
			e.searchTextLowerCase += ' ' + a[i].toLowerCase() ;
			continue ;
		}
		
		name  = a[i].slice(0,colonAt) ;
		value = a[i].slice(colonAt+1,a[i].length) ;
		
		name  = trimWhiteSpace(name ) ;
		value = trimWhiteSpace(value) ;
		
		if (value[0]==' ') continue ; // hack to skip real uses of colon
		
		//console.log( '\"' + name + '\"' + '::' + '\"' + value + '\"' ) ;

		if ( isUndef(e.tag[name]) ) e.tag[name] = {} ;
		
		e.tag[ name ][value] = 1 ;
		
		// add to search text
		e.searchTextLowerCase += ' ' + value.toLowerCase() ;
	}


	// size
	if ( 'size' in e.tag )
	{
		var s = e.tag.size ;
		
		for( var j in s ) e.size = parseInt(j) ;
	}
	

	// title
	e.title = trimWhiteSpace( a[1] ) ;

	//e.searchTextLowerCase += ' ' + e.title.toLowerCase() ;
	
	// date
	var date  = a[0] ;
	var dateRange = date.split("-") ; // maybe it's a range
	//console.log(dateRange) ;
		
	// split date into YY.MM.D (if done)
	dateRange[0] = dateRange[0].split(".") ;
	//dateRange[1] = dateRange[1].split(".") ;
		// need to be conditional on it existing
	
	//console.log(dateRange[0]) ;		
		
	e.year = dateRange[0][0] ;
		
	//e.searchTextLowerCase += ' ' + e.year ;

	
	// return
	return e ;
}

function pickEventView( pt )
{
	for( i in eventViews )
	{
		var v = eventViews[i] ;
		
		if ( v.group.bounds.contains(pt) ) return v ;
	}
	
	return null ;
}


	/*
	 *	Query utilities
	 */
	 
function filterEventByFuncFromQuery( query )
{
	query = trimWhiteSpace(query) ;
	
	
	var func = null ;
	
	
	if ( query.length > 0 )
	{

		var terms = query.split(" ") ;
		
		var notFunc = null ;
		var andFunc = null ;
		
		for ( var i in terms )
		{
			var term = trimWhiteSpace(terms[i]) ;
			
			if ( term[0] === '-' )
			{
				if ( term.length>1 )
				{
					term = term.substring(1) ;
					
					notFunc = filterEventByFuncOr( notFunc, filterEventByFindWordFunc(term) ) ;
					//console.log('-\''+term+'\'')  ;
				}
			}
			else if ( term[0] === '+' )
			{
				if ( term.length>1 )
				{
					term = term.substring(1) ;
					
					andFunc = filterEventByFuncAnd( andFunc, filterEventByFindWordFunc(term) ) ;
					//console.log('+\''+term+'\'')  ;
				}
			}
			else
			{
				func = filterEventByFuncOr( func, filterEventByFindWordFunc(term) ) ;
				//console.log('\''+term+'\'')  ;
			}
		}

		// NOT
		func = filterEventByFuncAnd( func, filterEventByFuncNot(notFunc) ) ;

		// AND
		func = filterEventByFuncAnd( func, andFunc ) ;
	}

	return func ;
}

function filterEventByFuncNot( func1 )
{
	if (func1===null) return null ;
	
	return function(e) { return !func1(e) ; }
}

function filterEventByFuncOr( func1, func2 )
{
	if		( func1===null ) return func2 ;
	else if ( func2===null ) return func1 ;

	return function( event ) {
		return func1(event) || func2(event) ;
	}
}

function filterEventByFuncAnd( func1, func2 )
{
	if		( func1===null ) return func2 ;
	else if ( func2===null ) return func1 ;

	return function( event ) { return func1(event) && func2(event) ; }
}

function filterEventByFindWordFunc( value )
{
	return function( event )
	{
		return event.findStringInEventLowerCase(value) ;
	}
}

function applyFilterToEventsView( filterEventFunc )
{
	value = trimWhiteSpace(value) ;
	
	var nMatches = 0 ;
	var noQuery = filterEventFunc===null ; //(value==="") ;
	//console.log( value + ', ' + !noQuery )
	
	value = value.toLowerCase() ;
	
	eventViews.map( function(eview) {
	
		//if ( noQuery || filterEventFunc(eview.event) )
		if ( noQuery || filterEventFunc(eview.event) )
		{
			eview.dot .fillColor.alpha = 1 ;			
			eview.text.fillColor.alpha = 1 ;

			eview.dot  .strokeWidth = 1 ;

			nMatches++ ;
		}
		else
		{
			eview.dot .fillColor.alpha = .3 ;
			eview.text.fillColor.alpha = .3 ;
			
			eview.dot .strokeWidth = .1 ;
		}
		
	}) ;
	
	var resultStr = "" ;
	
	if (!noQuery)
	{
		resultStr = nMatches + ' matches.' ;
	}
	
	$('#queryResult').text( resultStr ) ;
	
}




//
// Drawing/Layout
//

function sortEventsOfYear(a,b)
{
	function getx(e)
	{
		var x = 0 ;
		
		applyTag( eventTagX, e, function(tagx)
		{
			x = tagx ;
		}) ;
		
		return x ;
	}
	
	var ax = getx(a) ;
	var bx = getx(b) ;
	
	if		( ax < bx ) return -1 ;
	else if ( ax > bx ) return  1 ;
	else
	{
		if		( a.size < b.size ) return  1 ;
		else if ( a.size > b.size ) return -1 ;
		else return 0 ;
	}
}
	
function colorDotF( color )
{
	return function(dot)
	{
		dot.fillColor = color ;
	}
}

function applyTag( t, e, f )
{
	for ( var tag in t )
	{
		if ( e.hasTag(tag) ) f( t[tag] ) ;
	}
}

function addEventToView( event )		
{
	var xPx = itemFirstX ;

	//var event = events[i] ;

	// year out of bounds?
	if (event.year<yearStart) return ;
	if (event.year>yearEnd  ) return ;



	// size
	var sizes = {
		1 : 2 ,
		2 : 3 ,
		3 : 4 
	} ;
	
	var r   = sizes[event.size] //3 ;
	
	
	
	// dot
	var x = xPx ;

	applyTag( eventTagX, event,
		function( tagx )
		{
			x = tagx ;
		}) ;
	
	x = Math.max( x, yearThickness[event.year] ) ;
	
	x = Math.min( x, view.size.width-30 ) ; // display horiz. overload as glitch
	
	var loc = new Point( x, yearToPx(event.year)) ;
	
	var dot = new Path.Circle( loc, r ) ;
	dot.fillColor = new GrayColor( 0.7 ) ;
	

	// text
	var text = new PointText( loc + new Point(r*2,r+1) );
	text.justification = 'left';
	text.fillColor = new GrayColor( 0.9 ) ;
	text.fontSize = 12 - 2 + event.size ; //12 - 2 + event.size ;
	text.content = event.title ;
	
	
	// color	
	applyTag( eventTagF, event,
		function( f )
		{
			f(dot) ;
		}) ;
	
	if ( event.size==3 )
	{
		dot.strokeColor = 'black' ;
		dot.strokeWidth = 1 ;
		text.fillColor = 'black' ;
	}
	//else dot.strokeColor = new Color(0,0,0,0) ;
	
	
	//
	yearThickness[event.year] = text.bounds.right + itemHorizGutter ;
	//}


	// make view object
	v = new cEventView() ;
	
	v.text		=	 text  ;
	v.dot		=	 dot  ;
	v.event		=	 event  ;
	
	v.group = new Group( [dot,text] ) ;
	
	layerEvents.addChild(v.group) ;
	
	eventViews.push(v) ;
	
	return v ;
}

function addDateLines( layer )
{
	var left  = 50 ;
	var right = view.size.width ; //- left ;
	
	for( var year=yearStart; year <= yearEnd; year += yearMinorLine )
	{
		var y = yearToPx(year) ;

		var isMajor		= (year%yearMajorLine==0) ;
		var isMajorSeg	= (year%(yearMajorLine/2)==0) && !isMajor ;
		

		// line
		var line = new Path.Line( new Point(left,y), new Point(right,y) ) ;
		
		layer.addChild(line) ;
		
		if ( isMajorSeg )
		{
			line.strokeColor = new GrayColor( 0.2 ) ;
		}
		else line.strokeColor = new GrayColor( isMajor ? 0.15 : 0.075 );
		
		if ( isMajor ) line.strokeWidth = 2 ;

								
		
		// year #s
		if ( isMajor /*|| isMajorSeg*/ )
		{
			var text = new PointText( new Point(left-10,y + 4) );
			text.justification = 'right';
			text.fillColor = new GrayColor( isMajorSeg ? 0.25 : 0.5 );
			text.fontSize = 15 ;
			text.content = year ;
			
			layer.addChild(text) ;
		}
	}
}



function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
	
	return {
		content  : xmlHttp.responseText ,
		modified : xmlHttp.getResponseHeader ("Last-Modified")
	} ;
}





// from web/stack overflow
function Random( from, to )
{
	return Math.floor(Math.random()*(to-from+1)+from) ;
}


function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
/*
function insertParam(key, value)
{
    key = escape(key); value = escape(value);

    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--) 
    {
    	x = kvp[i].split('=');

    	if (x[0]==key)
    	{
    		x[1] = value;
    		kvp[i] = x.join('=');
    		break;
    	}
    }

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

	//console.log(document.location) ;

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&');	
}*/
