/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { CfnConnectorProfile } from 'aws-cdk-lib/aws-appflow';
import { Construct } from 'constructs';
import { MicrosoftSharepointOnlineConnectorType } from './type';
import { ConnectorAuthenticationType } from '../core/connectors/connector-authentication-type';
import { ConnectorProfileBase, ConnectorProfileProps } from '../core/connectors/connector-profile';
import { OAuth2GrantType as OAuthGrantType } from '../core/connectors/oauth2-granttype';

export interface MicrosoftSharepointOnlineConnectorProfileProps extends ConnectorProfileProps {
  readonly oAuth: MicrosoftSharepointOnlineOAuthSettings;
}

export interface MicrosoftSharepointOnlineOAuthEndpointsSettings {
  readonly token: string;
}

export interface MicrosoftSharepointOnlineRefreshTokenGrantFlow {
  readonly refreshToken?: string;
  readonly clientSecret?: string;
  readonly clientId?: string;
}

export interface MicrosoftSharepointOnlineOAuthFlow {
  readonly refreshTokenGrant: MicrosoftSharepointOnlineRefreshTokenGrantFlow;
}

export interface MicrosoftSharepointOnlineOAuthSettings {

  /**
   * The access token to be used when interacting with Google Analytics 4
   *
   * Note that if only the access token is provided AppFlow is not able to retrieve a fresh access token when the current one is expired
   */
  readonly accessToken?: string;

  readonly flow?: MicrosoftSharepointOnlineOAuthFlow;

  readonly endpoints: MicrosoftSharepointOnlineOAuthEndpointsSettings;
}

export class MicrosoftSharepointOnlineConnectorProfile extends ConnectorProfileBase {

  public static fromConnectionProfileArn(scope: Construct, id: string, arn: string) {
    return this._fromConnectorProfileAttributes(scope, id, { arn }) as MicrosoftSharepointOnlineConnectorProfile;
  }

  public static fromConnectionProfileName(scope: Construct, id: string, name: string) {
    return this._fromConnectorProfileAttributes(scope, id, { name }) as MicrosoftSharepointOnlineConnectorProfile;
  }

  constructor(scope: Construct, id: string, props: MicrosoftSharepointOnlineConnectorProfileProps) {
    super(scope, id, props, MicrosoftSharepointOnlineConnectorType.instance);
  }

  protected buildConnectorProfileProperties(
    props: ConnectorProfileProps,
  ): CfnConnectorProfile.ConnectorProfilePropertiesProperty {
    const properties = (props as MicrosoftSharepointOnlineConnectorProfileProps);
    return {
      customConnector: {
        oAuth2Properties: {
          // INFO: even if we're using a refresh token grant flow this property is required
          oAuth2GrantType: OAuthGrantType.AUTHORIZATION_CODE,
          // INFO: even if we provide only the access token this property is required
          // TODO: think about if this is correct. token can be IResolvable
          tokenUrl: properties.oAuth.endpoints?.token,
        },
      },
    };
  }

  protected buildConnectorProfileCredentials(
    props: ConnectorProfileProps,
  ): CfnConnectorProfile.ConnectorProfileCredentialsProperty {
    const properties = (props as MicrosoftSharepointOnlineConnectorProfileProps);

    return {
      customConnector: {
        oauth2: {
          // INFO: when using Refresh Token Grant Flow - access token property is required
          accessToken: properties.oAuth.accessToken ?? 'dummyAccessToken',
          refreshToken: properties.oAuth.flow?.refreshTokenGrant.refreshToken,
          clientId: properties.oAuth.flow?.refreshTokenGrant.clientId,
          clientSecret: properties.oAuth.flow?.refreshTokenGrant.clientSecret,
        },
        authenticationType: ConnectorAuthenticationType.OAUTH2,
      },
    };
  }
}