import { observer } from "mobx-react-lite";
import { Group, Button, Text, Tabs } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import authStore from "../../stores/authStore";

const Header = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };
  
  const getActiveTab = () => {
    if (location.pathname.includes('/claims')) return 'claims';
    if (location.pathname.includes('/mrf-files')) return 'mrf-files';
    return null;
  };
  
  return (
    <div className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo section */}
        <div>
          <Text size="lg" c="#00dd7c" fw={600}>Clearest Health</Text>
        </div>
        
        {/* Centered navigation tabs */}
        <div className="flex-grow flex justify-center">
          <Tabs value={getActiveTab()} onChange={(value) => navigate(`/${value}`)}>
            <Tabs.List>
              {authStore.isAuthenticated && (
                <Tabs.Tab value="claims">Claims Management</Tabs.Tab>
              )}
              <Tabs.Tab value="mrf-files">MRF Files</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </div>
        
        {/* User controls section */}
        <Group>
          {authStore.isAuthenticated ? (
            <>
              <Text size="sm">Welcome, {authStore.username}</Text>
              <Button variant="subtle" color="#00dd7c" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <Button variant="subtle" color="#00dd7c" size="sm" onClick={() => navigate('/login')}>
              Log in
            </Button>
          )}
        </Group>
      </div>
    </div>
  );
});

export default Header; 