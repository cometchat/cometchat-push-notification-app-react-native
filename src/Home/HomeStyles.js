import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  flex1: {flex: 1},
  headerText: {
    marginTop: '10%',
    color: '#0099FF',
    fontSize: 26,
    marginLeft: '5%',
  },
  userNameInputContainerStyle: {marginTop: '10%'},
  userNameInputStyles: {borderWidth: 0.5, borderColor: '#000'},
  userTypeContainer: {
    marginTop: '5%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#707070',
    marginHorizontal: '5%',
    borderRadius: 15,
  },
  selectedType: {
    width: '40%',
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
  },
  unselectedType: {
    width: '40%',
    backgroundColor: '#00000000',
    padding: 10,
    alignItems: 'center',
  },
  msgInputContainerStyle: {marginTop: 10},
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: '5%',
    justifyContent: 'space-around',
  },
  buttonStyle: {marginTop: 5, borderRadius: 8, width: '40%'},
  buttonTitleStyle: {fontSize: 18},
  logoutBtnStyles: {
    height: 50,
    width: '100%',
  },
});
