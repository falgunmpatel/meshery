import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  ModalFooter,
  useStepper,
  CustomizedStepper,
  ModalBody,
  Box,
  TextField,
  ModalButtonSecondary,
  ModalButtonPrimary,
  Grid,
  Select,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  FormControl,
  RadioGroup,
  MenuItem,
  Radio,
  styled,
} from '@layer5/sistent';
import BrushIcon from '@mui/icons-material/Brush';
import CategoryIcon from '@mui/icons-material/Category';
import SourceIcon from '@/assets/icons/SourceIcon';
import FinishFlagIcon from '@/assets/icons/FinishFlagIcon';
import { useContext, useState } from 'react';
import { capitalize } from 'lodash';
import { Loading } from '@/components/DesignLifeCycle/common';
import { NotificationCenterContext } from '../../NotificationCenter';
import { useEffect } from 'react';
import { OPERATION_CENTER_EVENTS } from 'machines/operationsCenter';
import { DeploymentSummaryFormatter } from '../../DesignLifeCycle/DeploymentSummary';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { modelCategories, modelShapes, modelSubCategories } from './data';
import { DeploymentSelectorIcon } from '@/assets/icons/DeploymentSelectorIcon';
const UrlStepper = React.memo(({ handleGenerateModal, handleClose }) => {
  const [modelSource, setModelSource] = React.useState('');
  const [modelName, setModelName] = React.useState('');
  const [modelDisplayName, setModelDisplayName] = React.useState('');
  const [modelCategory, setModelCategory] = React.useState('');
  const [modelSubcategory, setModelSubcategory] = React.useState('');
  const [modelShape, setModelShape] = React.useState('');
  const [modelUrl, setModelUrl] = React.useState('');
  const [urlError, setUrlError] = React.useState('');
  const [primaryColor, setPrimaryColor] = React.useState('#000000');
  const [secondaryColor, setSecondaryColor] = React.useState('#000000');
  const [logoLightThemePath, setLogoLightThemePath] = React.useState('');
  const [logoDarkThemePath, setLogoDarkThemePath] = React.useState('');
  const [registerModel] = React.useState(true);
  const [isAnnotation, setIsAnnotation] = React.useState(true);

  const handleLogoLightThemeChange = async (event) => {
    const file = event.target.files[0];

    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();

      reader.onload = (e) => {
        const svgData = e.target.result;
        setLogoLightThemePath(svgData);
      };
      reader.readAsText(file);
    } else {
      console.error('Please upload a valid SVG file.');
    }
  };

  const handleLogoDarkThemeChange = async (event) => {
    const file = event.target.files[0];

    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();

      reader.onload = (e) => {
        const svgData = e.target.result;
        setLogoDarkThemePath(svgData);
      };

      // Read the file as text (since it's an SVG)
      reader.readAsText(file);
    } else {
      console.error('Please upload a valid SVG file.');
    }
  };

  const validateUrl = (url, source) => {
    if (!url) {
      return false;
    }

    if (source === 'github') {
      return url.startsWith('git://github.com/');
    } else if (source === 'artifacthub') {
      return (
        url.startsWith('https://artifacthub.io/packages/') ||
        url.startsWith('http://artifacthub.io/packages/') ||
        url.startsWith('artifacthub.io/packages/')
      );
    }

    return false;
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setModelUrl(newUrl);
    if (modelSource) {
      const isValid = validateUrl(newUrl, modelSource);
      if (!isValid) {
        setUrlError(
          modelSource === 'github'
            ? 'Invalid GitHub URL. Format: git://github.com/org/repo/branch/path'
            : 'Invalid ArtifactHub URL. Example: https://artifacthub.io/packages/helm/org/package',
        );
      } else {
        setUrlError('');
      }
    }
  };

  const FinishDeploymentStep = ({ perform_deployment, deployment_type }) => {
    const { operationsCenterActorRef } = useContext(NotificationCenterContext);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployEvent, setDeployEvent] = useState();
    const [deployError, setDeployError] = useState(null);
    // const router = useRouter();

    useEffect(() => {
      try {
        setIsDeploying(true);
        perform_deployment();
      } catch (error) {
        setDeployError(error);
        setIsDeploying(false);
      }
    }, []);

    useEffect(() => {
      const subscription = operationsCenterActorRef.on(
        OPERATION_CENTER_EVENTS.EVENT_RECEIVED_FROM_SERVER,
        (event) => {
          const serverEvent = event.data.event;
          if (serverEvent.action === deployment_type) {
            setIsDeploying(false);
            setDeployEvent(serverEvent);
          }
        },
      );

      return () => subscription.unsubscribe();
    }, []);

    const progressMessage = `${capitalize(deployment_type)}ing model`;

    if (isDeploying) {
      return <Loading message={progressMessage} />;
    }
    console.log(deployError);
    if (deployError) {
      return (
        <Typography variant="h5" color="error">
          Error deploying design: {JSON.stringify(deployError)}
        </Typography>
      );
    }

    if (!deployEvent) {
      return null;
    }

    return <DeploymentSummaryFormatter event={deployEvent} />;
  };

  const handleFinish = async () => {
    try {
      const modelData = {
        uploadType: 'URL Import',
        register: registerModel,
        url: modelUrl,
        model: {
          model: modelName,
          modelDisplayName: modelDisplayName,
          registrant: modelSource,
          category: modelCategory,
          subCategory: modelSubcategory,
          shape: modelShape,
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
          svgColor: logoLightThemePath,
          svgWhite: logoDarkThemePath,
          isAnnotation: isAnnotation,
          publishToRegistry: true,
        },
      };
      await handleGenerateModal(modelData);
    } catch (error) {
      return error;
    }
  };
  // Styled components for consistent styling
  const StyledSummaryBox = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.default || '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  }));

  const StyledSummaryItem = styled(Box)(({ theme }) => ({
    borderRadius: '0.5rem',
    padding: '1rem',
    backgroundColor: theme.palette.background.paper || '#ffffff',
    flexGrow: 1,
  }));

  const SectionHeading = styled(Typography)(() => ({
    fontWeight: 'bold',
    marginTop: '1.5rem',
    marginBottom: '1rem',
  }));

  // Summary field component with consistent styling
  const SummaryField = ({ label, value, color }) => (
    <StyledSummaryItem>
      <Typography variant="textB2SemiBold" color="textSecondary">
        {label}
      </Typography>
      <Typography mt={1} style={color ? { color: color } : {}}>
        {value}
      </Typography>
    </StyledSummaryItem>
  );

  // Color display component
  const ColorDisplay = ({ color }) => (
    <Box
      sx={{
        width: '1.5rem',
        height: '1.5rem',
        borderRadius: '4px',
        backgroundColor: color,
        marginRight: '0.5rem',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
  // SVG Logo display component that renders SVG content
  const SvgLogoDisplay = ({ svgContent }) => {
    if (!svgContent) {
      return (
        <Typography color="textSecondary" variant="body2">
          No logo uploaded
        </Typography>
      );
    }

    // Create a data URL from the SVG content
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;

    return (
      <Box mt={1}>
        <img src={svgDataUrl} alt="Logo" height="40" style={{ maxWidth: '100%' }} />
      </Box>
    );
  };

  const urlStepper = useStepper({
    steps: [
      {
        component: (
          <div>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography>
                Please enter the appropriate <strong>Model Name</strong> (a unique name with
                hyphens, not whitespaces) and <strong>Model Display Name</strong> for your model.
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    required
                    id="model-name"
                    label="Model Name"
                    placeholder="my-model"
                    helperText="Model name should be in lowercase with hyphens, not whitespaces."
                    error={modelName.length > 0 && !/^[a-z0-9-]+$/.test(modelName)}
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    required
                    id="model-display-name"
                    label="Model Display Name"
                    placeholder="a friendly name for my model"
                    helperText="Model display name should be a friendly name for your model."
                    error={
                      modelDisplayName.length > 0 && !/^[a-zA-Z0-9\s]+$/.test(modelDisplayName)
                    }
                    value={modelDisplayName}
                    onChange={(e) => setModelDisplayName(e.target.value)}
                    variant="outlined"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </div>
        ),
        icon: DescriptionIcon,
        label: 'Model Details',
        helpText: (
          <>
            <ul>
              <li>
                <strong>Model Name:</strong> Should be in lowercase with hyphens. For example,{' '}
                <em>cert-manager</em>. This is the unique name for the model within the scope of a
                registrant (
                <a href="https://docs.meshery.io/concepts/logical/registry">
                  learn more about registrants
                </a>
                ).
              </li>
              <br />
              <li>
                <strong>Display Name:</strong> Model display name should be a friendly name for your
                model. For example, <em>Cert Manager</em>.
              </li>
            </ul>
          </>
        ),
      },
      {
        component: (
          <div>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography>
                {' '}
                Please select the appropriate <strong>Category</strong> and
                <strong>Subcategory</strong> relevant to your model.
                <br />
                <em>
                  Note: If you can&apos;t find the appropriate category or subcategory, please
                  select <strong>Uncategorized</strong>
                </em>
                .
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={modelCategory}
                    label="Category"
                    onChange={(e) => setModelCategory(e.target.value)}
                  >
                    {modelCategories.map((category, idx) => (
                      <MenuItem key={idx} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="subcategory-label">Subcategory</InputLabel>
                  <Select
                    labelId="subcategory-label"
                    id="subcategory"
                    value={modelSubcategory}
                    label="Subcategory"
                    onChange={(e) => setModelSubcategory(e.target.value)}
                  >
                    {modelSubCategories.map((subCategory, idx) => (
                      <MenuItem key={idx} value={subCategory}>
                        {subCategory}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </div>
        ),
        icon: CategoryIcon,
        label: 'Model Categorization',
        helpText: (
          <>
            <ul>
              <li>
                <strong>Category:</strong> Determines the main grouping.
              </li>
              <li>
                <strong>Subcategory:</strong> Allows for more specific classification.
              </li>
            </ul>
          </>
        ),
      },
      {
        component: (
          <div>
            <Box display="flex" alignItems="center" mb="2rem">
              <Typography>
                Configure icons, colors, and a default shape for your model and its components.
                <br />
                <em>Note: If none of these are provided, default Meshery values will be used.</em>
              </Typography>
            </Box>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <FormControl fullWidth variant="outlined">
                  <Typography>Logo (Dark Theme)</Typography>
                  <input
                    id="logo-dark-theme"
                    type="file"
                    accept=".svg"
                    onChange={handleLogoDarkThemeChange}
                    style={{ marginTop: '1rem' }}
                    label=" "
                  />
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Typography>Logo (Light Theme)</Typography>
                  <input
                    id="logo-light-theme"
                    type="file"
                    accept=".svg"
                    onChange={handleLogoLightThemeChange}
                    style={{ marginTop: '1rem' }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={6} style={{ marginTop: '2rem' }}>
                <FormControl fullWidth>
                  <Typography>Primary Color</Typography>
                  <input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '100%', marginTop: '1rem' }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={6} style={{ marginTop: '2rem' }}>
                <FormControl fullWidth>
                  <Typography>Secondary Color</Typography>
                  <input
                    id="secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ width: '100%', marginTop: '1rem' }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} style={{ marginTop: '1rem' }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="shape-label">Shape</InputLabel>
                  <Select
                    labelId="shape-label"
                    id="shape"
                    value={modelShape}
                    label="Shape"
                    onChange={(e) => setModelShape(e.target.value)}
                  >
                    {modelShapes.map((shape, idx) => (
                      <MenuItem key={idx} value={shape}>
                        {shape}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </div>
        ),
        icon: BrushIcon,
        label: 'Styling',
        helpText: (
          <>
            <p>
              Configure your model&apos;s logos, primary and secondary colors, and shape. If none of
              these are provided, default Meshery values will be used.
            </p>
            <ul>
              <li>
                <strong>Primary Color:</strong> The main color used in your model&apos;s theme.
              </li>
              <br />
              <li>
                <strong>Secondary Color:</strong> The accent color used in your model&apos;s theme.
              </li>
              <br />
              <li>
                <strong>Shape:</strong> The shape used for visual elements in your model.
              </li>
            </ul>
          </>
        ),
      },
      {
        component: (
          <div>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography>
                Please identify the location from which to source your model&apos;s components.
              </Typography>
            </Box>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="source"
                name="source"
                value={modelSource}
                onChange={(e) => setModelSource(e.target.value.toLowerCase())}
                style={{ gap: '2rem' }}
              >
                {['Artifact Hub', 'GitHub'].map((source, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={source.toLowerCase()}
                    control={<Radio />}
                    label={<>{source}</>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth style={{ marginTop: '1rem' }}>
              <TextField
                required
                id="model-url"
                label="Model URL"
                value={modelUrl}
                onChange={handleUrlChange}
                variant="outlined"
                error={!!urlError}
                helperText={urlError}
                disabled={!modelSource}
                placeholder={
                  modelSource === 'github'
                    ? 'git://github.com/org/repo/branch/path'
                    : modelSource === 'artifacthub'
                      ? 'https://artifacthub.io/packages/helm/org/package'
                      : 'Select a source first'
                }
              />
            </FormControl>
          </div>
        ),
        icon: SourceIcon,
        label: 'Source',
        helpText: (
          <>
            <ul>
              <li>
                <strong>Artifact Hub:</strong> Artifact Hub package URL. For example,{' '}
                <em>https://artifacthub.io/packages/search?ts_query_web={'{model-name}'}</em>.
              </li>
              <br />
              <li>
                <strong>GitHub:</strong> Provide a GitHub repository URL. For example,{' '}
                <em>git://github.com/cert-manager/cert-manager/master/deploy/crds</em>.
              </li>
            </ul>
            <p>
              Learn more about the process of{' '}
              <a href="https://docs.meshery.io/guides/configuration-management/generating-models">
                creating and importing models
              </a>
              .
            </p>
          </>
        ),
      },
      {
        component: (
          <div>
            {/* <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormControlLabel
                  style={{ marginLeft: '0' }}
                  label="Would you like to register the model now so you can use it immediately after it's generated?"
                  labelPlacement="start"
                  control={
                    <Checkbox
                      checked={registerModel}
                      onChange={(e) => setRegisterModel(e.target.checked)}
                      name="registerModel"
                      color="primary"
                      st
                    />
                  }
                />
              </FormControl>
            </Grid> */}
            <Grid item xs={12} style={{ marginTop: '1rem' }}>
              <FormControl component="fieldset">
                <FormControlLabel
                  style={{ marginLeft: '0' }}
                  label="The components in this model are visual annotations only."
                  labelPlacement="start"
                  control={
                    <Checkbox
                      checked={isAnnotation}
                      onChange={(e) => setIsAnnotation(e.target.checked)}
                      name="registerModel"
                      color="primary"
                    />
                  }
                />
              </FormControl>
            </Grid>
          </div>
        ),
        icon: AppRegistrationIcon,
        label: 'Additional Details',
        helpText: (
          <>
            <p>Specify your preferences for model registration and usage:</p>
            <ul>
              {/* <li>
                <strong>Register Model Now</strong>: Choose this option to register the model
                immediately after it&apos;s generated, allowing you to use it right away.
              </li>
              <br /> */}
              <li>
                <strong>Visual Annotation Only</strong>: Select this if the model is exclusively for
                visual annotation purposes and its compoonents are not to be orchestrated
                (meaningfully used during deploy/undeploy operations); e.g. custom shapes, lines,
                arrow and so on that serve to enhance comprehension or visual design.
              </li>
            </ul>
          </>
        ),
      },
      {
        component: (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Model Generation Summary
              </Typography>
            </Box>

            <StyledSummaryBox>
              <SectionHeading variant="subtitle1">Basic Information</SectionHeading>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SummaryField label="Model Name" value={modelName} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryField label="Display Name" value={modelDisplayName} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryField label="Category" value={modelCategory} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryField label="Subcategory" value={modelSubcategory} />
                </Grid>
              </Grid>

              <SectionHeading variant="subtitle1">Styling</SectionHeading>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <StyledSummaryItem>
                    <Typography variant="textB2SemiBold" color="textSecondary">
                      Primary Color
                    </Typography>
                    <Box mt={1} display="flex" alignItems="center">
                      <ColorDisplay color={primaryColor} />
                      <Typography>{primaryColor}</Typography>
                    </Box>
                  </StyledSummaryItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledSummaryItem>
                    <Typography variant="textB2SemiBold" color="textSecondary">
                      Secondary Color
                    </Typography>
                    <Box mt={1} display="flex" alignItems="center">
                      <ColorDisplay color={secondaryColor} />
                      <Typography>{secondaryColor}</Typography>
                    </Box>
                  </StyledSummaryItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryField label="Shape" value={modelShape} />
                </Grid>
              </Grid>

              <SectionHeading variant="subtitle1">Logos</SectionHeading>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <StyledSummaryItem>
                    <Typography variant="textB2SemiBold" color="textSecondary">
                      Light Theme Logo
                    </Typography>
                    <SvgLogoDisplay svgContent={logoLightThemePath} />
                  </StyledSummaryItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledSummaryItem>
                    <Typography variant="textB2SemiBold" color="textSecondary">
                      Dark Theme Logo
                    </Typography>
                    <SvgLogoDisplay svgContent={logoDarkThemePath} />
                  </StyledSummaryItem>
                </Grid>
              </Grid>

              <SectionHeading variant="subtitle1">Source</SectionHeading>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SummaryField label="Source Type" value={capitalize(modelSource || '')} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SummaryField label="URL" value={modelUrl} />
                </Grid>
              </Grid>

              <SectionHeading variant="subtitle1">Additional Configuration</SectionHeading>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SummaryField
                    label="Visual Annotation Only"
                    value={isAnnotation ? 'Yes' : 'No'}
                  />
                </Grid>
              </Grid>
            </StyledSummaryBox>

            <Box sx={{ marginTop: '1rem' }}>
              <Typography variant="body2" color="textSecondary">
                Please review all details before proceeding with model generation. Once you click
                Generate, the model will be created with the configuration shown above.
              </Typography>
            </Box>
          </Box>
        ),
        icon: DeploymentSelectorIcon,
        label: 'Finalize Generation',
        helpText: (
          <>
            <p>
              Review all the details before generating your model. This summary shows all the
              configuration options youve selected throughout the wizard.
            </p>

            <p>
              If you need to make any changes, use the Back button to navigate to the step and
              modify your selections.
            </p>
            <p>
              Learn more about{' '}
              <a href="https://docs.meshery.io/guides/configuration-management/generating-models">
                Model Generation
              </a>
              .
            </p>
          </>
        ),
      },
      {
        component: (
          <FinishDeploymentStep perform_deployment={handleFinish} deployment_type="register" />
        ),
        label: 'Finsh',
        icon: FinishFlagIcon,
      },
    ],
  });
  //
  const transitionConfig = {
    0: {
      canGoNext: () => modelDisplayName && modelName,
      nextButtonText: 'Next',
      nextAction: () => urlStepper.handleNext(),
    },
    1: {
      canGoNext: () => modelCategory && modelSubcategory,
      nextButtonText: 'Next',
      nextAction: () => urlStepper.handleNext(),
    },
    2: {
      canGoNext: () => true,
      nextButtonText: 'Next',
      nextAction: () => urlStepper.handleNext(),
    },
    3: {
      canGoNext: () => modelSource && modelUrl && !urlError,
      nextButtonText: 'Next',
      nextAction: () => urlStepper.handleNext(),
    },
    4: {
      canGoNext: () => true,
      nextButtonText: 'Next',
      nextAction: () => {
        urlStepper.handleNext();
      },
    },
    5: {
      canGoNext: () => true,
      nextButtonText: 'Generate',
      nextAction: () => urlStepper.handleNext(),
    },
    6: {
      canGoNext: () => true,
      nextButtonText: 'Finish',
      nextAction: handleClose,
    },
  };

  const canGoNext = transitionConfig[urlStepper.activeStep].canGoNext();
  const nextButtonText = transitionConfig[urlStepper.activeStep].nextButtonText;

  return (
    <>
      <ModalBody>
        <CustomizedStepper {...urlStepper}>{urlStepper.activeStepComponent}</CustomizedStepper>
      </ModalBody>
      <ModalFooter
        variant="filled"
        helpText={urlStepper.steps[urlStepper.activeStep]?.helpText || ``}
      >
        <Box style={{ width: '100%', display: 'flex', gap: '1rem', justifyContent: 'end' }}>
          <ModalButtonSecondary onClick={urlStepper.goBack} disabled={!urlStepper.canGoBack}>
            Back
          </ModalButtonSecondary>
          <ModalButtonPrimary
            disabled={!canGoNext}
            onClick={transitionConfig[urlStepper.activeStep].nextAction}
          >
            {nextButtonText}
          </ModalButtonPrimary>
        </Box>
      </ModalFooter>
    </>
  );
});

UrlStepper.displayName = 'Create';

export default UrlStepper;
