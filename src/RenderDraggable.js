/*
	Component called for each resource mapped in side effect in App.js. Each component needs to be passed the 'state grid' boundaries as props
	so they know what they'll land in. 
	
	Each square will need to be identified by both its index and its dimensions. For example, for a 3x2 grid (numbers are arbitrary):
	0 => x: 0-100, y: 0-100
	1 => x: 100-200, y: 0-100
	2 => x: 200-300, y: 0-100
	3 => x: 0-100, y: 100-200
	4 => x: 100-200, y: 100-200
	5 => x: 200-300, y: 100-200

	The above serves as the global representation that each panresponder will be made aware of. 

	By this dimensions table, the res will know to change the internal state of its position. When the app is closed, these new positions 
	will update the database (but only if that position has changed).

	The very tricky thing here will be bouncing a res out of its square when its touched by the incoming res that the user is holding. 
	How will internal state of invaded res be updated? Maybe, I could create a state hook to listen to whether or not one of my 
	grid dimensions is completely empty. If thats the case, I could then have another internal state hook here that will listen to 
	whether or not an adjacent grid is empty.

	If a res realizes that an adjacent square is empty, a chain reaction will start. The grids will only move to the left. So, 
	squares to the immediate left will have to move up and all the way to the right. 
*/

import React, { 
  useRef, 
  useEffect, 
  useState,
  useContext 
} from 'react';
import {  
  StyleSheet, 
  Text, 
  View,
  PanResponder,
  Animated
} from 'react-native';

import { 
  GridContext, 
  buildGrid, 
  changeColumn,
  calcMotion
} from "./components/contexts/GridContext";

let CIRCLE_RADIUS = 36;
const styles = StyleSheet.create({
	circle : {
      backgroundColor     : '#1abc9c',
      width               : CIRCLE_RADIUS*2,
      height              : CIRCLE_RADIUS*2,
      borderRadius        : CIRCLE_RADIUS
    },
  text : {
      marginTop   : 25,
      marginLeft  : 5,
      marginRight : 5,
      textAlign   : 'center',
      color       : '#fff'
  },
})

export default function RenderDraggable(props) {
  // idx will mark what grid locale the res eventually ends up in. 
  // If props.idx === idx, don't make a write to the database. 
  const [idx, setIdx] = useState(props.idx);
  const [position, setPosition] = useState(props.position);
  const [gridState, dispatch] = useContext(GridContext);

  useEffect(() => {
    var virtualGridSquare = {};
    virtualGridSquare['id'] = props.id;
    virtualGridSquare['pos'] = props.position;
    dispatch(buildGrid(virtualGridSquare))
  }, [props])

  useEffect(() => {
    // get the actionPosition from the updated gridStatre and mash it into a number
    const actionPosition = Number(gridState.grid.map(gg => gg[props.id]).filter(x=>x!=undefined))
    // compare it against the current position
    if (actionPosition !== position) {
      const delta = (actionPosition - position);
      // if delta is negative, we can glean something about what the direction of the motion should be 
      //console.log('props.id: ', props.id);
      //console.log('WEGOTACTION');

      //dispatch(calcMotion(delta));

      // so now, not only do I have to change the position of this res in the gridState object 
      // (which will in turn trigger this effect!) but, in the reducer, I will also need to find 
      // what res is currently at the actionPosition, send the reducer method both the actionPosition
      // and this delta variable and go from there
    } else {
      // find if there is a doubled value
      //debugger
      // if there is in fact a doubled value, find out why, and move accordingly?

    }
    // IF MY ACTION POSITON IS THE SAME AS MY POSITION, MEANING I HAVENT MOVED, I WANT TO CHECK TO SEE IF ANYONE IS IN MY 
    // GRID SQUARE 
  }, [gridState])



  // useEffect(() => {
  //   // update gridState change here
  //   logUpdatedGridState();
  //   //console.log('grid context has changed! props.id: ', props.id)
  // }, [gridState])

  // function logUpdatedGridState() {
  //   console.log('grid context has changed! props.id: ', props.id)
  // }
  // the cardinal directions serve as the left, top, right, and 
  // bottom boundaries of each grid square
  const [eastBound, setEastBound] = useState(props.eastBound);
  const [southBound, setSouthBound] = useState(props.southBound);
  const [westBound, setWestBound] = useState(props.westBound);
  const [northBound, setNorthBound] = useState(props.northBound);
  const [column, setColumn] = useState(props.column);
  const [row, setRow] = useState(props.row);
  const oneColumn = (props.width / 3);
  const oneRow = (props.height / 3);

  // https://reactjs.org/docs/hooks-reference.html#useref
  // Create an instance of Animated.ValueXY. This component will take care of interpolating X and Y values. We will 
  // run the animations by setting these values to the style of the element to animate.
  const pan = useRef(new Animated.ValueXY()).current

  // Create the PanResponder, which is responsible for doing the dragging. We are setting the handlers when the user 
  // moves and releases the element.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      //The handler will trigger when the element is moving. 
      //We need to set the animated values to perform the dragging correctly.
      onPanResponderGrant: () => {
        console.log('height: ', props.height);
        console.log('width: ', props.width);
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({
          x: 0,
          y: 0
        })
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        {
        	useNativeDriver: true,
        	listener: (event, gestureState) => {
            // I may not need the cardinal dir bounds, but, on the fly, if I have 
            // TWO grid resources with the same position, I can have the reducer 
            // method act accordingly and bounce the unheld res

            // The immediate bounds of each grid square is not exactly what I need. 
            // What I need is to know what 'sector' of the screen the resouce is
            // hovering over. From there, I can phone the reducer and let it know 
            // what resource(s) is/are in what square 
            // if x is LESS THAN 1/3 OF WIDTH, it is in column 1
            // if y is LESS THAN 1/3 OF HEIGHT, it is in row 1


            // if x is LESS THAN 2/3 OF WIDTH BUT ALSO GREATER THAN 1/3 OF WIDTH, it is in column 2
            // if y is LESS THAN 2/3 OF HEIGHT BUT ALSO GREATER THAN 1/3 OF HEIGHT, it is in row 2

            // if x is GREATER THAN 2/3 OF WIDTH, it is in column 3
            // if y is GREATER THAN 2/3 OF HEIGHT, it is in row 3
            if ((gestureState.moveX >= oneColumn) && (gestureState.moveX < (oneColumn*2))) {
              if (column === 2) {
                //console.log('state has not changed here in column 2');
              } else {
                dispatch(changeColumn(2, props.position, props.id))
                //setColumn(2);
                //console.log('res is now in column 2');
              }
              //setColumn(2);
            } else if (gestureState.moveX < oneColumn)  {
              if (column === 1) {
                console.log('state has not changed here in column 1')
              } else {
                //console.log('res is now in column 1');
                dispatch(changeColumn(1, props.position, props.id));
                //setColumn(1);
              }
              // setColumn(1);
            } else {
              if (column === 3) {
                console.log('state has not changed here in column 3')
              } else {
                console.log('res is now in column 3');
                dispatch(changeColumn(3, props.position, props.id));
                //setColumn(3);
              }
              //setColumn(3);
            }
        		// console.log(
          //     'onPanResponderMove [event, gestureState]: ', 
          //     event, 
          //     gestureState
          //   )
        	}
        }
      ),
      onPanResponderRelease: (event, gestureState) => {
        console.log('onPanResponderRelease gestureState: ', gestureState);
        // console.log('event.TouchHistory.touchBank.startPageX:', event.touchHistory.touchBank[0].startPageX)
        // console.log('event.TouchHistory.touchBank.currentPageX:', event.touchHistory.touchBank[0].currentPageX)
        // console.log('event.TouchHistory.touchBank.startPageY:', event.touchHistory.touchBank[0].startPageY)
        // console.log('event.TouchHistory.touchBank.currentPageY:', event.touchHistory.touchBank[0].currentPageY)
        // const bank = event.touchHistory.touchBank[0];
        // const horizontalTravel = bank.currentPageX - bank.startPageX;
        // const verticalTravel = bank.currentPageY - bank.startPageY;

        // const horizontalTravel = event.touchHistory.touchBank[0].currentPageX - event.touchHistory.touchBank[0].startPageX;
        // const verticalTravel = event.touchHistory.touchBank[0].currentPageY - event.touchHistory.touchBank[0].startPageY;

        const eastBoundCond = gestureState.moveX < eastBound;
        const southBoundCond = gestureState.moveY < southBound;
        const westBoundCond = gestureState.moveX > westBound;
        const northBoundCond = gestureState.moveY > northBound && southBoundCond;


        console.log('gestureState.moveX: ', gestureState.moveX)

        console.log('eastBoundCond: ', eastBoundCond);
        console.log('southBoundCond: ', southBoundCond);
        console.log('westBoundCond: ', westBoundCond);
        console.log('northBoundCond: ', northBoundCond);

        if (eastBoundCond && southBoundCond && northBoundCond && westBoundCond) {
          Animated.spring(
            pan,
            { toValue: { x: 0, y: 0 } }    
          ).start();
        } else {
          if (gestureState.dx < 0 && southBoundCond) {
            Animated.spring(
              pan,
              { toValue: { x: -(oneColumn), y: 0 } }    
            ).start();
          } else if (gestureState.dx > props.width && southBoundCond) {
            Animated.spring(
              pan,
              { toValue: { x: props.width, y: 0 } }    
            ).start();           
          }
          // find out which square we landed in !!!!!!!
            // if horizontalTravel < 0 && southBoundCond, WE WENT LEFT
              // southboundCond is true ? then I didn't go far enough to leave the square in the south direction
            // if horizontalTravel > 373.66666 && southBoundCond, WE WENT RIGHT

          // spring to the top left corner of that square !!!!!!!!
            // left => x: -373.66666, y: 0
            // right => x: 373.66666, y: 0
            // up => x: 0, y: -100?
            // down => x: 0, y: 100

            // down-left => x: -373.66666, y: 100,
            // down-right => x: 373.66666, y: 100,
            // up-right => x: 373.66666, y: -100,
            // up-left => x: -373.66666, y: -100
            // Animated.spring(
            //   pan,
            //   { toValue: { x: 100, y: 100 } }    
            // ).start();

          // setState to reflect the new bounds  !!!!!!!!


          //pan.flattenOffset();
        }
      }
    })
  ).current;

  return (
      <Animated.View 
        {...panResponder.panHandlers}
        style={[
          // getLayout method returns the left and top properties with the correct 
          // values for each frame during the animation.
        	pan.getLayout(), 
        	styles.circle
        ]}
      >
        <Text style={styles.text}>{props.position}</Text>
      </Animated.View>
  );
}