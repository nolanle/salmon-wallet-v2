import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import get from 'lodash/get';

import { AppContext } from '../../AppProvider';
import { useNavigation, withParams } from '../../routes/hooks';
import { ROUTES_MAP } from './routes';
import { withTranslation } from '../../hooks/useTranslations';
import { cache, CACHE_TYPES } from '../../utils/cache';
import { getShortAddress } from '../../utils/wallet';
import { getMediaRemoteUrl } from '../../utils/media';
import { showValue } from '../../utils/amount';

import theme, { globalStyles } from '../../component-library/Global/theme';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalButton from '../../component-library/Global/GlobalButton';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalText from '../../component-library/Global/GlobalText';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import CardButton from '../../component-library/CardButton/CardButton';
import Header from '../../component-library/Layout/Header';
import IconSolana from '../../assets/images/IconSolana.png';
import IconHyperspaceWhite from '../../assets/images/IconHyperspaceWhite.png';
import IconHyperspace from '../../assets/images/IconHyperspace.jpeg';

import useAnalyticsEventTracker from '../../hooks/useAnalyticsEventTracker';
import { SECTIONS_MAP } from '../../utils/tracking';

const styles = StyleSheet.create({
  renderItemStyle: {
    width: '49%',
    marginBottom: theme.gutters.paddingXS,
  },
  columnWrapperStyle: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nftImage: {
    width: '80%',
    margin: 'auto',
  },
  imageContainer: {
    flexGrow: 1,
    width: '100%',
  },
  hyperspaceIcon: {
    marginBottom: -3,
    marginLeft: 4,
  },
  topPriceIcon: {
    marginBottom: -3,
    marginLeft: 2,
    position: 'absolute',
    right: 8,
  },
  biddedBtn: {
    fontSize: theme.fontSize.fontSizeSM,
    lineHeight: theme.lineHeight.lineHeightSM,
  },
});

const NftsBuyDetailPage = ({ params, t }) => {
  useAnalyticsEventTracker(SECTIONS_MAP.NFTS_BUY_DETAIL);
  const navigate = useNavigation();
  const [{ activeWallet, config }] = useContext(AppContext);
  const [loaded, setLoaded] = useState(false);
  const [bidsLoaded, setBidsLoaded] = useState(false);
  const [nftDetail, setNftDetail] = useState({});
  const [bidAmount, setBidAmount] = useState(null);
  const [price, setPrice] = useState(null);
  const [solBalance, setSolBalance] = useState(null);

  useEffect(() => {
    if (activeWallet) {
      Promise.all([
        activeWallet.getBalance(),
        activeWallet.getCollectionItems(params.id),
      ]).then(async ([balance, nfts]) => {
        const tks = balance.items || [];
        const nft = nfts.market_place_snapshots.find(
          n => n.token_address === params.nftId,
        );
        if (nft) {
          setNftDetail(nft);
          setPrice(nft?.lowest_listing_mpa?.price);
        }
        setSolBalance(tks.length ? tks[0] : null);
        setLoaded(true);
        const bids = await activeWallet.getNftsBids();
        setBidAmount(
          bids.find(b => b.token_address === params.nftId)?.market_place_state
            ?.price || null,
        );
        setBidsLoaded(true);
      });
    }
  }, [activeWallet, params.id, params.nftId]);

  const attributes = Object.entries(get(nftDetail, 'attributes', []));
  attributes.pop();

  const getBidBtnTitle = () =>
    !bidsLoaded ? (
      '...'
    ) : bidAmount ? (
      <>
        {t('nft.cancel_offer', { bidAmount })}{' '}
        <GlobalImage
          source={IconSolana}
          size="xxs"
          circle
          style={{ marginBottom: -4 }}
        />
      </>
    ) : (
      t('nft.make_offer')
    );

  const hasProperties = () => {
    return Object.keys(get(nftDetail, 'attributes', [])).length > 1;
  };

  const goToBack = () => {
    navigate(ROUTES_MAP.NFTS_COLLECTION_DETAIL, {
      id: params.id,
    });
  };

  const goToBuy = () => {
    navigate(ROUTES_MAP.NFTS_BUYING, {
      id: nftDetail.project_id,
      nftId: nftDetail.token_address,
      type: 'buy',
    });
  };

  const goToOffer = () => {
    navigate(ROUTES_MAP.NFTS_BIDDING, {
      id: nftDetail.project_id,
      nftId: nftDetail.token_address,
      type: bidAmount ? 'cancel-offer' : 'create-offer',
    });
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.renderItemStyle}>
        <CardButton
          key={item.title}
          caption={item.caption}
          title={item.title}
          description={item.description}
          nospace
          readonly
        />
      </View>
    );
  };

  const getPropertiesData = () => [
    {
      caption: t('nft.current_price'),
      title: `${price.toFixed(2)} SOL (${showValue(
        (price === '.' ? 0 : price) * solBalance?.usdPrice,
        2,
      )} 
      ${t('general.usd')})`,
    },
    {
      caption: t('nft.owned_by'),
      title: getShortAddress(nftDetail?.lowest_listing_mpa?.user_address),
    },
    {
      caption: t('nft.creator_royalty'),
      title: `${nftDetail?.lowest_listing_mpa?.fee}%`,
    },
    // {
    //   caption: t('nft.marketplace'),
    //   title: `${nftDetail.volume_1day} SOL`,
    // },
    {
      caption: t('nft.mint_address'),
      title: getShortAddress(nftDetail?.token_address),
    },
  ];

  return (
    (loaded && (
      <GlobalLayout fullscreen>
        <GlobalLayout.Header>
          <Header activeWallet={activeWallet} config={config} t={t} />
          <GlobalBackTitle
            onBack={goToBack}
            inlineTitle={
              <GlobalText type="headline2" center>
                {nftDetail.name}
              </GlobalText>
            }
            nospace
          />

          <GlobalPadding size="xxs" />

          <View style={globalStyles.centered}>
            <GlobalPadding size="xs" />

            <View style={styles.imageContainer}>
              <GlobalImage
                source={getMediaRemoteUrl(nftDetail.meta_data_img)}
                style={styles.nftImage}
                square
                squircle
              />
            </View>

            <GlobalPadding size="lg" />

            <View style={globalStyles.inlineFlexButtons}>
              <GlobalButton
                type="primary"
                flex
                title={t('nft.buy_now')}
                onPress={goToBuy}
                style={[globalStyles.button, globalStyles.buttonLeft]}
                touchableStyles={globalStyles.buttonTouchable}
              />

              <GlobalButton
                type="secondary"
                flex
                title={getBidBtnTitle()}
                onPress={goToOffer}
                disabled={!bidsLoaded}
                textStyle={bidAmount && styles.biddedBtn}
                style={[globalStyles.button, globalStyles.buttonRight]}
                touchableStyles={globalStyles.buttonTouchable}
              />
            </View>
          </View>

          <GlobalPadding size="xl" />
          <GlobalText type="body2">{t('nft.details')}</GlobalText>

          <GlobalPadding size="sm" />

          <FlatList
            data={getPropertiesData()}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapperStyle}
          />

          <GlobalPadding size="xl" />
          {hasProperties() && (
            <>
              <GlobalText type="body2">{t('nft.properties')}</GlobalText>

              <GlobalPadding size="sm" />

              <FlatList
                data={attributes.map(([k, v], i) => ({
                  caption: k.charAt(0).toUpperCase() + k.slice(1),
                  title: v.charAt(0).toUpperCase() + v.slice(1),
                  description: '',
                }))}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapperStyle}
              />
            </>
          )}
        </GlobalLayout.Header>
      </GlobalLayout>
    )) ||
    null
  );
};

export default withParams(withTranslation()(NftsBuyDetailPage));