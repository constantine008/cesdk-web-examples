import CreativeEditorSDK from '@cesdk/cesdk-js';
import { ColorPicker } from 'components/ui/ColorPicker/ColorPicker';
import SegmentedControl from 'components/ui/SegmentedControl/SegmentedControl';
import React, { useEffect, useRef, useState } from 'react';
import {
  generateColorAbstractionTokensAccent,
  generateColorAbstractionTokensActive,
  generateColorAbstractionTokensBackground,
  generateStaticTokens
} from './color';

const DEFAULT_BACKGROUND_COLOR = '#121921';
const DEFAULT_ACTIVE_COLOR = '#FDFDFD';
const DEFAULT_ACCENT_COLOR = '#4B64E2';

const themeColors = {
  light: {
    backgroundColor: '#D6DBE1',
    activeColor: '#4E545A',
    accentColor: '#4260F5'
  },
  dark: {
    backgroundColor: '#121A21',
    activeColor: '#F5F5F5',
    accentColor: '#415AD3'
  }
};

const ThemingCESDK = () => {
  const [chosenTheme, setChosenTheme] = useState('dark');
  const [scale, setScale] = useState('normal');
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [accentColor, setAccentColor] = useState(null);
  const cesdkContainer = useRef(null);

  const useCustomTheme = !!backgroundColor || !!activeColor || !!accentColor;
  const calculatedTheme = useCustomTheme ? 'custom' : chosenTheme;
  const resetCustomTheme = () => {
    setBackgroundColor(null);
    setActiveColor(null);
    setAccentColor(null);
  };

  useEffect(() => {
    let cesdk;
    let config = {
      theme: chosenTheme,
      role: 'Adopter',
      license: process.env.REACT_APP_LICENSE,
      callbacks: {
        onExport: 'download',
        onUpload: 'local'
      },
      ui: {
        scale: scale,
        elements: {
          panels: {
            settings: true
          },
          navigation: {
            action: {
              export: {
                show: true,
                format: ['image/png', 'application/pdf']
              }
            }
          }
        }
      }
    };
    if (cesdkContainer.current) {
      CreativeEditorSDK.create(cesdkContainer.current, config).then(
        async (instance) => {
          instance.addDefaultAssetSources();
          instance.addDemoAssetSources({sceneMode: 'Design'});
          cesdk = instance;
          await cesdk.loadFromURL(`${window.location.protocol + "//" + window.location.host}/example-1-adopter.scene`);
        }
      );
    }
    return () => {
      if (cesdk) {
        cesdk.dispose();
      }
    };
  }, [chosenTheme, scale, cesdkContainer]);

  const customThemeStyle = useCustomTheme
    ? generateCustomThemeStyle(
        generateCustomTheme(
          backgroundColor || DEFAULT_BACKGROUND_COLOR,
          activeColor || DEFAULT_ACTIVE_COLOR,
          accentColor || DEFAULT_ACCENT_COLOR
        )
      )
    : '';

  return (
    <div style={wrapperStyle}>
      <div style={cesdkWrapperStyle}>
        <style>{customThemeStyle}</style>
        <div ref={cesdkContainer} style={cesdkStyle}></div>
      </div>
      <div style={sidebarStyle}>
        <div>
          <SegmentedControl
            label="UI Scaling"
            options={[
              { label: 'Normal', value: 'normal' },
              { label: 'Large', value: 'large' }
            ]}
            value={scale}
            name="scale"
            onChange={(value) => setScale(value)}
          />
        </div>
        <hr />
        <SegmentedControl
          label="Theme"
          options={[
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' }
          ]}
          value={calculatedTheme}
          name="theme"
          onChange={(value) => {
            resetCustomTheme();
            setChosenTheme(value);
          }}
        />
        <ColorPicker
          label="Background"
          value={backgroundColor || themeColors[chosenTheme]?.backgroundColor}
          name="backgroundColor"
          onChange={(value) => setBackgroundColor(value)}
          presetColors={['#DCDFE1', '#230D38', '#242623', '#FCEFEB', '#060709']}
        />
        <ColorPicker
          label="Active"
          value={activeColor || themeColors[chosenTheme]?.activeColor}
          name="activeColor"
          onChange={(value) => setActiveColor(value)}
          presetColors={['#5D6266', '#D142A3', '#BBC6A4', '#F4BCAC', '#4D5E6D']}
        />
        <ColorPicker
          label="Accent"
          value={accentColor || themeColors[chosenTheme]?.accentColor}
          name="accentColor"
          onChange={(value) => setAccentColor(value)}
          presetColors={['#3E4044', '#66D3EB', '#F6CE4B', '#265E7A', '#D0FDEB']}
        />
      </div>
    </div>
  );
};

const generateCustomTheme = (backgroundColor, activeColor, accentColor) => ({
  ...generateColorAbstractionTokensAccent(accentColor),
  ...generateColorAbstractionTokensBackground(backgroundColor),
  ...generateColorAbstractionTokensActive(activeColor),
  ...generateStaticTokens()
});
const generateCustomThemeStyle = (customThemeProperties) => `
  .ubq-public{
    ${Object.entries(customThemeProperties)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')}
  }
`;

const cesdkStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

const cesdkWrapperStyle = {
  position: 'relative',
  minHeight: '640px',
  overflow: 'hidden',
  flexGrow: 1,
  display: 'flex',
  borderRadius: '0.75rem',
  boxShadow:
    '0px 0px 2px rgba(22, 22, 23, 0.25), 0px 4px 6px -2px rgba(22, 22, 23, 0.12), 0px 2px 2.5px -2px rgba(22, 22, 23, 0.12), 0px 1px 1.75px -2px rgba(22, 22, 23, 0.12)'
};

const wrapperStyle = {
  minHeight: '640px',
  display: 'flex',
  borderRadius: '0.75rem',
  flexGrow: '1',
  gap: '1rem'
};
const sidebarStyle = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  background: '#fff',
  borderRadius: '16px',
  boxShadow:
    '0px 0px 2px rgba(22, 22, 23, 0.25), 0px 4px 6px -2px rgba(22, 22, 23, 0.12), 0px 2px 2.5px -2px rgba(22, 22, 23, 0.12), 0px 1px 1.75px -2px rgba(22, 22, 23, 0.12)',
  color: '#161617',
  flexBasis: '280px',
  flexShrink: 0,
  padding: '16px 20px',
  gap: '16px'
};

export default ThemingCESDK;
