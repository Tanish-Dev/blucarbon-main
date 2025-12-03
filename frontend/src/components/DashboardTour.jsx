import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const DashboardTour = ({ run, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">Welcome to BluCarbon! 🌍</h2>
          <p className="text-slate-600">
            Let's take a quick tour to help you get started with your carbon credit platform. 
            This will only take a minute!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="stats"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Dashboard Overview</h3>
          <p className="text-slate-600">
            Track your key metrics here: total projects, carbon credits, issued credits, 
            and pending verifications. These update in real-time as you manage your projects.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="quick-actions"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
          <p className="text-slate-600">
            Access the most important features quickly:
          </p>
          <ul className="list-disc ml-5 mt-2 text-sm text-slate-600 space-y-1">
            <li><strong>Register Project:</strong> Start a new carbon project</li>
            <li><strong>Upload Field Data:</strong> Add measurement data</li>
            <li><strong>Run dMRV:</strong> Generate verification reports</li>
            <li><strong>Marketplace:</strong> Browse and trade credits</li>
          </ul>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="project-map"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Project Map</h3>
          <p className="text-slate-600">
            Visualize all your projects on an interactive map. Click on markers to view 
            project details and monitor their geographic distribution.
          </p>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="recent-projects"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Recent Projects</h3>
          <p className="text-slate-600">
            View your most recently created or updated projects. Click on any project 
            to see detailed information and manage it.
          </p>
        </div>
      ),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2">You're All Set! 🎉</h2>
          <p className="text-slate-600 mb-3">
            You've completed the tour! You can always restart it from your settings.
          </p>
          <p className="text-sm text-slate-500">
            <strong>Pro tip:</strong> Start by registering your first project to unlock 
            all features of the platform.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      // Tour completed or skipped
      setStepIndex(0);
      if (onComplete) {
        onComplete();
      }
    }

    if (type === 'step:after') {
      setStepIndex(index + 1);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#10b981', // Emerald color
          textColor: '#1e293b',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          arrowColor: '#ffffff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 16,
          padding: 24,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#10b981',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          marginRight: 10,
          color: '#64748b',
          fontSize: 14,
        },
        buttonSkip: {
          color: '#64748b',
          fontSize: 14,
        },
        tooltipContent: {
          padding: '0',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};

export default DashboardTour;
