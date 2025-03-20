import { useState } from 'react';
import axios from 'axios';
import {
  Card,
  Text,
  Button,
  TextField,
  Layout,
  Page,
  BlockStack,
  // InlineStack
} from "@shopify/polaris";

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

  const saveToShopify = async (agentId, token) => {
    try {
      await axios.post(saveMetafieldsUrl, { agentId, token });
    } catch (error) {
      alert("Saving metafields in Shopify failed");
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {step === 1 && (
              <Card>
                <BlockStack gap="400" padding="400">
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
                  <Button onClick={registerUser} primary>Register</Button>
                </BlockStack>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <BlockStack gap="400" padding="400">
                  <Text as="h2" variant="headingMd">Login</Text>
                  <Button onClick={loginUser} primary>Login with provided credentials</Button>
                </BlockStack>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <BlockStack gap="400" padding="400">
                  <Text as="h2" variant="headingMd">Create Your Company</Text>
                  <TextField
                    label="Company Name"
                    value={companyName}
                    onChange={setCompanyName}
                  />
                  <Button onClick={createCompany} primary>Create Company</Button>
                </BlockStack>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <BlockStack gap="400" padding="400">
                  <Text as="h2" variant="headingMd">Create Your Agent</Text>
                  <TextField
                    label="Agent Name"
                    value={agentName}
                    onChange={setAgentName}
                  />
                  <Button onClick={createAgent} primary>Create Agent</Button>
                </BlockStack>
              </Card>
            )}

            {step === 5 && (
              <Card>
                <BlockStack gap="400" padding="400" align="center">
                  <Text as="h2" variant="headingMd">✅ Agent Created & Saved!</Text>
                  <Text>Agent ID: {agentId}</Text>
                  <Text>You can now start using the chatbox on your store!</Text>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
