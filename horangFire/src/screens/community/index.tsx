import React, {useState, useEffect} from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {color, font} from '../../styles/colorAndFontTheme';
import Btn from '../../components/common/Btn_short';
import imagesPath from '../../assets/image/constants/imagesPath';
import {ParamListBase} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import api from '../../api/api_controller';
import NoticeItem from '../../components/community/NoticeItem';
import CommunityGalleryItem from '../../components/community/CommunityGalleryItem';

// style
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  text: {
    fontFamily: font.beeMid,
    fontSize: 80,
    color: color.BLACK_3A,
    textAlign: 'center',
  },
  body: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  box1: {
    flex: 1,
  },
  box2: {
    flex: 4,
    zIndex: 1,
    paddingTop: 30,
    paddingBottom: 80,
  },
  midTitle: {
    fontFamily: font.beeMid,
    color: color.BLACK_3A,
    fontSize: 30,
    paddingBottom: 12,
    textAlign: 'center',
  },
  contents: {
    width: '100%',
    backgroundColor: 'blue',
  },
  // dropdown
  textContainer: {
    fontSize: 20,
    fontFamily: font.beeMid,
    color: color.BROWN_78,
  },
  container: {
    alignItems: 'center',
    zIndex: 100,
  },
  bottom: {
    fontSize: 32,
    fontFamily: font.beeMid,
    color: color.BLACK_3A,
  },
  row: {
    flexDirection: 'column',
  },
  dropDownStyle: {
    borderColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 100,
    justifyContents: 'center',
  },
  tab: {
    backgroundColor: color.MODAL_SUB,
    color: color.BACK,
    zIndex: 30,
    borderRadius: 10,
    marginVertical: 2,
    paddingHorizontal: 10,
    width: 130,
    alignItems: 'center',
  },

  // Contents
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  tableBox: {
    flex: 1,
  },
  loaderStyle: {
    marginVertical: 16,
    alignItems: 'center',
  },
  arrowBtn: {
    width: 30,
    height: 20,
  },
  back: {
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',
    marginBottom: -20,
    zIndex: 200,
  },
});

// Types

interface valueType {
  id: number;
  name: string;
}

interface Props {
  navigation: StackNavigationProp<ParamListBase, 'Community'>;
}
interface Community {
  id: number;
  charactersId: number;
  userId: string;
  userCharacterId: number;
  content: string;
  imgUrl: string;
  createDate: number;
  name: string;
}
interface Notice {
  id: number;
  userId: string;
  title: string;
  content: string;
  createDate: string;
}

const Community = ({navigation}: Props) => {
  // Datas
  const data: valueType[] = [
    {id: 0, name: '??????'},
    {id: 1, name: '???????????????'},
    {id: 2, name: '????????????'},
    {id: 3, name: '?????????????????????'},
    {id: 4, name: '???????????????'},
    {id: 5, name: '??????'},
  ];
  const [isNotice, setIsNotice] = useState(false);
  const [showOption, setShowOption] = useState(false);
  const [selectedItem, setSelectedItem] = useState<valueType>(data[0]);
  const [communityData, setCommunityData] = useState<Community[]>([]);
  const [lastId, setLastId] = useState<number>(-1);
  const [noticeData, setNoticeData] = useState<Notice[]>([]);
  const [allDataLength, setAllDataLength] = useState<number>(12);
  const [dataLength, setDataLength] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(false);

  // When Toggle Button Clicked
  const onSelectedItem = (val: valueType) => {
    setCommunityData([]); // ???????????? ????????? ?????????
    setSelectedItem(val); // ????????? ?????? ?????? => useEffect(selectedITem) ?????? => ???????????? ????????????
    setShowOption(false); // ?????? ??????
    setIsNotice(false); // ???????????? ????????? (title ?????????)
    setLastId(-1);
  };

  // ???????????? ??????
  const noticeHandle = () => {
    setIsNotice(true); // title '????????????'?????? ???????????? ??????
    setShowOption(false); // ?????? ?????? ????????? ??????????????? ??????
    setSelectedItem(data[0]); // ?????? ?????? '??????'??? ??????????????????
  };

  // ????????? ???????????? ???????????? axios
  const getCommunityAnimalsAll = async (character_id: number) => {
    setLoading(true);
    try {
      const response = await api.community.getCommunityAnimalsAll(
        character_id,
        lastId,
      );
      setCommunityData(prev => [...prev, ...response.data]);
      setDataLength(response.data.length);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ?????? ???????????? ???????????? axios
  const getCommunityAll = async () => {
    setLoading(true);
    try {
      const response = await api.community.getCommunityAll(lastId);
      setCommunityData(prev => [...prev, ...response.data]);
      setAllDataLength(response.data.length);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ???????????? ???????????? axios
  const getNoticeAll = async () => {
    try {
      const response = await api.notice.getNoticeAll();
      setNoticeData(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getNoticeAll();
    // ?????? ????????? ?????? - ?????? ???????????? ????????????
    if (selectedItem.id === 0) {
      getCommunityAll();
      // ????????? ????????? ?????? - ????????? ???????????? ????????????
    } else if (selectedItem.id >= 1) {
      getCommunityAnimalsAll(selectedItem.id);
    }
  }, [selectedItem, lastId]);

  // ????????? ????????? ????????? ???
  const onEndReached = () => {
    if (selectedItem.id === 0) {
      if (!loading && allDataLength % 12 === 0) {
        // ???????????? ?????? ??????, ????????? ???????????? ????????? ?????? ???????????? ??????
        setLastId(communityData[communityData.length - 1].id);
      }
    } else {
      // ?????? ?????? ???
      if (!loading && dataLength % 12 === 0) {
        // ???????????? ?????? ??????, ????????? ???????????? ????????? ?????? ???????????? ??????
        setLastId(communityData[communityData.length - 1].id);
      }
    }
  };

  return (
    <ImageBackground
      style={styles.background}
      source={require('../../assets/image/commuBack.png')}>
      <SafeAreaView>
        <View style={styles.body}>
          <TouchableOpacity
            style={styles.back}
            onPress={() => navigation.navigate('Home')}>
            {/* <View style={styles.arrow}> */}
            <Image
              style={styles.arrowBtn}
              source={require('../../assets/image/icon/left_arrow.png')}
            />
            {/* </View> */}
          </TouchableOpacity>
          <View style={styles.box1}>
            <View style={styles.container}>
              <Text style={styles.bottom}>Community</Text>
              <View style={styles.row}>
                <Text>
                  {/* ?????? ?????? */}
                  <TouchableOpacity
                    style={styles.dropDownStyle}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowOption(!showOption);
                    }}>
                    <Text style={styles.textContainer}>
                      {selectedItem?.name}
                    </Text>
                    <Image
                      style={{
                        transform: [{rotate: showOption ? '180deg' : '0deg'}],
                        paddingRight: 10,
                      }}
                      source={imagesPath.icDropDown}
                    />
                  </TouchableOpacity>
                  <Text>
                    <Text style={styles.textContainer}> | </Text>
                    <TouchableOpacity onPress={noticeHandle}>
                      <Text style={styles.textContainer}>????????????</Text>
                    </TouchableOpacity>
                  </Text>
                </Text>
                {showOption && (
                  <View style={styles.tab}>
                    {data &&
                      data.map((val, i) => {
                        return (
                          <TouchableOpacity
                            key={String(i)}
                            onPress={() => onSelectedItem(val, i)}>
                            <Text style={styles.textContainer}>
                              {selectedItem ? val.name : '??????'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.box2}>
            {/* ????????? (?????? ?????? ?????? ????????????) */}
            <Text style={styles.midTitle}>
              {isNotice ? '????????????' : selectedItem.name}
            </Text>

            {/* ?????? ?????? ???????????? ????????? */}
            <View style={styles.contentContainer}>
              {isNotice ? (
                <View>
                  {/* ?????? ????????? */}
                  <FlatList
                    // style={styles.tableNotice}
                    data={noticeData}
                    renderItem={item => (
                      <NoticeItem navigation={navigation} item={item.item} />
                    )}
                    numColumns={1}
                    key={'noticeFlatlist'}
                  />
                </View>
              ) : (
                <View>
                  {/* ???????????? ????????? */}
                  <FlatList
                    style={styles.tableBox}
                    data={communityData}
                    renderItem={item => (
                      <CommunityGalleryItem
                        navigation={navigation}
                        item={item.item}
                      />
                    )}
                    key={'communityFlatlist'}
                    numColumns={3}
                    onEndReached={onEndReached} // ???????????? ????????? ????????? ??? ??????
                    onEndReachedThreshold={0} // ???????????? ????????????
                    ListFooterComponent={
                      // ?????? ?????? ??? ????????? ????????? ???????????????
                      loading ? (
                        <View style={styles.loaderStyle}>
                          <ActivityIndicator size="small" color="aaa" />
                        </View>
                      ) : null
                    }
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Community;
