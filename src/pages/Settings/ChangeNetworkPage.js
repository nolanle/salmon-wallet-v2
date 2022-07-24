import React, { useContext } from 'react';

import { AppContext } from '../../AppProvider';
import { GlobalLayoutForTabScreen } from '../../component-library/Global/GlobalLayout';
import CardButton from '../../component-library/CardButton/CardButton';
import GlobalPadding from '../../component-library/Global/GlobalPadding';
import GlobalText from '../../component-library/Global/GlobalText';
import { getWalletChain } from '../../utils/wallet';
import GlobalBackTitle from '../../component-library/Global/GlobalBackTitle';
import { useNavigation } from '../../routes/hooks';
import { ROUTES_MAP } from './routes';

const ChangeNetworkPage = () => {
  const navigate = useNavigation();
  const [{ activeWallet, selectedEndpoints }, { changeEndpoint }] =
    useContext(AppContext);
  const onSelect = value => {
    changeEndpoint(getWalletChain(activeWallet), value);
  };
  const onBack = () => navigate(ROUTES_MAP.SETTINGS_OPTIONS);

  return (
    <GlobalLayoutForTabScreen>
      <GlobalBackTitle onBack={onBack} title="Select Network" />

      <GlobalPadding />

      {activeWallet
        .getNetworks()
        .map(({ networkId: label, nodeUrl: endpoint }) => (
          <CardButton
            key={label}
            active={label === selectedEndpoints[getWalletChain(activeWallet)]}
            complete={label === selectedEndpoints[getWalletChain(activeWallet)]}
            title={label}
            description={endpoint}
            onPress={() => onSelect(label)}
          />
        ))}
    </GlobalLayoutForTabScreen>
  );
};

export default ChangeNetworkPage;