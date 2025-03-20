import { useState } from 'react';
import axios from 'axios';
import {
  Card,
  Text,
  Button,
  TextField,
  Layout,
  Page,
  Box,
  BlockStack
} from "@shopify/polaris";

interface SaveToShopifyParams {
  agentId: string;
  token: string;
}

export default function DashboardRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [agentId, setAgentId] = useState('');
  const apiBaseUrl = "https://sheldon-ai-f0ad075692ae.herokuapp.com";

  const saveMetafieldsUrl = "/api/save-metafields";

  const registerUser = async () => {
    try {
      await axios.post(`${apiBaseUrl}/auth/register`, { email, password });
      setStep(2);
    } catch (error) {
      alert("Registration failed");
    }
  };

  const loginUser = async () => {
    try {
      const res = await axios.post(`${apiBaseUrl}/auth/login`, { email, password });
      setAccessToken(res.data.access_token);
      setStep(3);
    } catch (error) {
      alert("Login failed");
    }
  };

  const createCompany = async () => {
    try {
      const res = await axios.post(`${apiBaseUrl}/company`, { name: companyName }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCompanyId(res.data.data.company.id);
      setStep(4);
    } catch (error) {
      alert("Company creation failed");
    }
  };

  const createAgent = async () => {
    try {
      const res = await axios.post(
        `${apiBaseUrl}/agent/${companyId}/create-agent`,
        { name: agentName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const newAgentId = res.data.data.agent.id;
      setAgentId(newAgentId);
      await saveToShopify(newAgentId, accessToken);
      setStep(5);
    } catch (error) {
      alert("Agent creation failed");
    }
  };

  const saveToShopify = async (agentId: string, token: string) => {
    try {
      await axios.post(saveMetafieldsUrl, { agentId, token } as SaveToShopifyParams);
    } catch (error) {
      alert("Saving metafields in Shopify failed");
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="4">
            {step === 1 && (
              <Card>
                <Box padding="4">
                  <BlockStack gap="4">
                    <Text as="h2" variant="headingMd">Register Your Account</Text>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                    />
                    <Button onClick={registerUser} variant="primary">Register</Button>
                  </BlockStack>
                </Box>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <Box padding="4">
                  <BlockStack gap="4">
                    <Text as="h2" variant="headingMd">Login</Text>
                    <Button onClick={loginUser} variant="primary">Login with provided credentials</Button>
                  </BlockStack>
                </Box>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <Box padding="4">
                  <BlockStack gap="4">
                    <Text as="h2" variant="headingMd">Create Your Company</Text>
                    <TextField
                      label="Company Name"
                      value={companyName}
                      onChange={setCompanyName}
                      autoComplete="off"
                    />
                    <Button onClick={createCompany} variant="primary">Create Company</Button>
                  </BlockStack>
                </Box>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <Box padding="4">
                  <BlockStack gap="4">
                    <Text as="h2" variant="headingMd">Create Your Agent</Text>
                    <TextField
                      label="Agent Name"
                      value={agentName}
                      onChange={setAgentName}
                      autoComplete="off"
                    />
                    <Button onClick={createAgent} variant="primary">Create Agent</Button>
                  </BlockStack>
                </Box>
              </Card>
            )}

            {step === 5 && (
              <Card>
                <Box padding="4">
                  <BlockStack gap="4" align="center">
                    <Text as="h2" variant="headingMd">✅ Agent Created & Saved!</Text>
                    <Text as="p" variant="bodyMd">Agent ID: {agentId}</Text>
                    <Text as="p" variant="bodyMd">You can now start using the chatbox on your store!</Text>
                  </BlockStack>
                </Box>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
