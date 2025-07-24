import React from 'react';
import { NavigationGuide as Guide } from '@/utils/navigationGuide';
import { Compass, ChevronRight, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NavigationHelperProps {
  guide: Guide;
  query: string;
}

export const NavigationHelper: React.FC<NavigationHelperProps> = ({ guide, query }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg font-semibold text-primary">
            ROVER Navigation Guide
          </CardTitle>
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            Finding: {guide.title}
          </h3>
          <p className="text-muted-foreground italic">{guide.description}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Navigation Methods */}
        <div className="space-y-4">
          {guide.methods.map((method, methodIndex) => (
            <div key={methodIndex} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={method.recommended ? "default" : "secondary"}
                  className="font-medium"
                >
                  Method {methodIndex + 1}: {method.name}
                  {method.recommended && " (Recommended)"}
                </Badge>
              </div>
              
              <div className="ml-4 space-y-2">
                {method.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {step.icon && <span className="text-lg">{step.icon}</span>}
                        <span className="font-medium text-foreground">
                          {step.description.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </span>
                      </div>
                      {step.location && (
                        <p className="text-sm text-muted-foreground">
                          📍 {step.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* What you'll find there */}
        {guide.relatedFeatures && guide.relatedFeatures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">What you'll find there:</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
              {guide.relatedFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pro Tips */}
        {guide.proTips && guide.proTips.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-foreground">Pro Tips:</h4>
            </div>
            <div className="space-y-2 ml-6">
              {guide.proTips.map((tip, index) => (
                <div key={index} className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Help footer */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            ❓ <strong>Still can't find it?</strong> Reply with "still stuck" and I'll provide more help!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationHelper;