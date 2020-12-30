import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  flex1: {
    flex: 1,
  },
  cometChatLogo: {
    height: 100,
    aspectRatio: 1,
  },
  cometChatLabel: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#707070',
    marginTop: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 26,
    color: '#0099FF',
    marginTop: 10,
  },
  loginContainer: {flex: 1, marginTop: 10, padding: '5%'},
  loginHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#707070',
    marginTop: 10,
  },
  userListContainer: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  userContainer: {
    backgroundColor: '#000',
    width: '40%',
    margin: '5%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    flexDirection: 'row',
  },
  headerContainer: {marginLeft: '5%', marginTop: '10%'},
  userIcon: {height: 30, width: 30, marginHorizontal: 5},
  userNameText: {color: '#fff', fontSize: 16},
  inputStyles: {marginTop: 5},
  buttonStyle: {marginTop: 5, backgroundColor: '#000'},
  buttonTextStyle: {fontSize: 18},
});
