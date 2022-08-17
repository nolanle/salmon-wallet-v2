import React, { useContext } from 'react';
import { View } from 'react-native';

import { ROUTES_MAP as ROUTES_SETTINGS_MAP } from './routes';
import { useNavigation, withParams } from '../../routes/hooks';
import { withTranslation } from '../../hooks/useTranslations';

import { globalStyles } from '../../component-library/Global/theme';
import GlobalLayout from '../../component-library/Global/GlobalLayout';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import GlobalImage from '../../component-library/Global/GlobalImage';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalButton from '../../component-library/Global/GlobalButton';
import { getWalletAvatar } from '../../utils/wallet';
import { AppContext } from '../../AppProvider';
import { getMediaRemoteUrl } from '../../utils/media';

const AccountEditProfilePage = ({ params, t }) => {
  const navigate = useNavigation();
  const [{ config }] = useContext(AppContext);

  const onBack = () =>
    navigate(ROUTES_SETTINGS_MAP.SETTINGS_ACCOUNT_EDIT, {
      address: params.address,
    });
  const onSelectNft = () =>
    navigate(ROUTES_SETTINGS_MAP.SETTINGS_ACCOUNT_EDIT_PROFILE_NFTS, {
      address: params.address,
    });

  return (
    <GlobalLayout>
      <GlobalLayout.Header>
        <GlobalBackTitle
          onBack={onBack}
          title={t(`settings.wallets.set_profile_picture`)}
        />

        <View style={globalStyles.centered}>
          <GlobalImage
            source={getMediaRemoteUrl(getWalletAvatar(params.address, config))}
            size="4xl"
            style={globalStyles.bigImage}
            circle
          />

          <GlobalPadding />

          <GlobalButton
            type="primary"
            wideSmall
            title={t('settings.wallets.select_nft')}
            onPress={onSelectNft}
          />

          <GlobalPadding />

          <GlobalButton
            type="primary"
            wideSmall
            title={t('settings.wallets.upload_photo')}
            onPress={() => {}}
          />
        </View>
      </GlobalLayout.Header>
    </GlobalLayout>
  );
};

export default withParams(withTranslation()(AccountEditProfilePage));
