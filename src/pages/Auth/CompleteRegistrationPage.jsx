import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Password from "../../components/Auth/Password";
import UserName from "../../components/Auth/UserName";

const CompleteRegistrationPage = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = location.state;
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: userData?.email,
    fullName: userData?.name,
    profilePicture: userData?.picture,
  });

  console.log("formData is ", formData);

  const handleNext = () => {
    setCurrentStage(currentStage + 1);
  };

  const handleBack = () => {
    setCurrentStage(currentStage - 1);
  };

  useEffect(() => {
    if (!userData) {
      navigate("/accounts/signup");
    }
  }, [navigate, userData]);

  return (
    <div className="auth-form-wrapper">
      {currentStage === 1 && (
        <UserName
          formData={formData}
          setFormData={setFormData}
          onNext={handleNext}
        />
      )}
      {currentStage === 2 && (
        <Password
          formData={formData}
          setFormData={setFormData}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default CompleteRegistrationPage;
